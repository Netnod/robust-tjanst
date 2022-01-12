const { upsertDomain, getDomainByID } = require('./db/queries/domains')
const { insertNewTestRun, getTestRunByID, getTestResultByID } = require('./db/queries/tests')
const { Queue } = require('bullmq')
const IORedis = require('ioredis')
const { parseUrl } = require('common/url')
const { RESULTORS, GROUPINGS, GROUP_DESCRIPTIONS } = require('tests')

const testQueue = new Queue('run_tests', {connection: new IORedis(process.env.REDIS_URL)})

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
    const msgFn = RESULTORS[result.test_name]
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

  const test_run_id = await ctx.dbPool.connect(async (connection) => {
    // TODO: Transaction?
    const {domain_id} = await connection.one(upsertDomain(parsedUrl.host))
    const {test_run_id} = await connection.one(insertNewTestRun(domain_id))
    const job = await testQueue.add('Test run request', {test_run_id, arguments: parsedUrl})

    // TODO: Wait for results
    console.log(`job_id:${job.id} test_run_id:${test_run_id} domain_id:${domain_id}`)
    return test_run_id
  })

  await ctx.redirect(ctx.state.namedPath('test_page', {id: test_run_id}))
}

async function showTest(ctx) {
  const {id} = ctx.request.params

  await ctx.dbPool.connect(async (connection) => {
    const test = await connection.one(getTestRunByID(id))
    const result = await connection.any(getTestResultByID(id))
    if (result.length === 0) { return ctx.render('tests/loading') }

    const domain = await connection.one(getDomainByID(test.domain_id))
    const groups = buildGroups(result)
    await ctx.render('tests/show', {test, domain, groups, md: require('markdown-it')()})
  })
}

module.exports = {createTest, showTest}
