const { upsertDomain, getDomainByID } = require('./db/queries/domains')
const { insertNewTestRun, getTestRunByPublicID, getTestResultByID } = require('./db/queries/tests')
const { Queue } = require('bullmq')
const IORedis = require('ioredis')
const { RESULTORS, GROUPINGS, GROUP_DESCRIPTIONS } = require('tests')
const parseUrl = require('./lib/parseUrl')

const testQueue = new Queue('run_tests', {connection: new IORedis(process.env.REDIS_URL)})

const failedMessageFn = () => ({
  title: "Detta test kraschade :-(",
  passed: false,
  description: ""
})

const buildGroups = (results) => {
  const groups = Object.values(GROUPINGS).reduce(
    (acc, next) => ({
      ...acc, 
      [next]: {
        key: next,
        tests: []
      }
    }), 
    {}
  )
  for (const result of results) {
    const msgFn = result.execution_status === 'completed' ? RESULTORS[result.test_name] : failedMessageFn
    if (!msgFn) throw new Error(`No result message function for ${result.test_name}`)
    const group = GROUPINGS[result.test_name]
    if (!group || !groups[group]) throw new Error(`No group for ${result.test_name}`)
    groups[group].tests.push(msgFn(result.test_output))
  }

  for (const group of Object.keys(groups)) {
    Object.assign(groups[group], GROUP_DESCRIPTIONS[group](groups[group].tests))
  }

  return groups
}

async function createTest(ctx) {

  const parsedUrl = parseUrl(ctx.request.body.url)

  const id = await ctx.dbPool.connect(async (connection) => {
    const {test_run_id, public_id} = await connection.transaction(async trx => {
      const {domain_id} = await connection.one(upsertDomain(parsedUrl.host))
       return connection.one(insertNewTestRun(domain_id))
    })
    await testQueue.add('Test run request', {test_run_id, arguments: parsedUrl})

    return public_id 
  })

  await ctx.redirect(ctx.state.namedPath('test_page', {id}))
}

async function getTestLoadingStatus(ctx) {
  const {id} = ctx.request.params
  const {total, done} = await ctx.dbPool.connect(async (connection) => {
    const test = await connection.one(getTestRunByPublicID(id))
    const tests = await connection.any(getTestResultByID(test.id))

    const total = tests.length
    const done = tests.filter(t => t.execution_status !== 'pending').length
    return {total, done}
  })

  ctx.type = 'application/json'
  ctx.body = JSON.stringify({total, done})
}

async function showTest(ctx) {
  const {id} = ctx.request.params
  console.log('starting test', id)
  try {

    await ctx.dbPool.connect(async (connection) => {
      const test = await connection.one(getTestRunByPublicID(id))
      console.log('found test?', test, id)
      const tests = await connection.any(getTestResultByID(test.id))
      console.log('found tests?', tests)

      if (tests.length === 0 || tests.some(test => test.execution_status === 'pending')) { 
        const total = tests.length
        const done = tests.filter(t => t.execution_status !== 'pending').length
        return ctx.render('tests/loading', {test_id: test.public_id, total, done}) 
      }

      const allTestsPassed = tests.every(t => t.test_output.passed && t.execution_status === 'completed')
      const domain = await connection.one(getDomainByID(test.domain_id))
      const groups = buildGroups(tests)
      await ctx.render('tests/show', {test, allTestsPassed, domain, groups, md: require('markdown-it')()})
    })
  } catch (err) {
    console.log('error', err)
    ctx.status = 500
  }

}

module.exports = {createTest, showTest, getTestLoadingStatus}
