const { sql } = require('slonik')
const { getDomainByID } = require('./db/queries/domains')
const { getTestByID, getTestPartsAndGroupsByTestID } = require('./db/queries/tests')
const { Queue } = require('bullmq')
const IORedis = require('ioredis')

function upsertURL(url) {
  return sql`
    INSERT INTO domains (domain_name)
    VALUES (${url})
    ON CONFLICT ON CONSTRAINT domains_domain_name_key
    DO UPDATE SET domain_name=domains.domain_name
    -- This ensures we have an id to return ^
    RETURNING id AS domain_id
  `
}

function insertNewTest(domain_id) {
  return sql`
    INSERT INTO tests (domain_id)
    VALUES (${domain_id}) 
    RETURNING id AS test_id
  `
}

const testQueue = new Queue('run_tests', {connection: new IORedis(process.env.REDIS_URL)})

async function createTest(ctx) {
  // // TODO: Validate URL
  const {url} = ctx.request.body
  // // TODO: "Owned" URLs are perhaps "private"

  const test_id = await ctx.dbPool.connect(async (connection) => {
    // TODO: Transaction?
    const {domain_id} = await connection.one(upsertURL(url))
    const {test_id} = await connection.one(insertNewTest(domain_id))
    const job = await testQueue.add('blabla', {test_id, url})

    // TODO: Wait for results
    console.log(`job_id:${job.id} test_id:${test_id} domain_id:${domain_id}`)
    return test_id
  })

  await ctx.redirect(ctx.state.namedPath('test_page', {id: test_id}))
}

async function showTest(ctx) {
  const {id} = ctx.request.params

  await ctx.dbPool.connect(async (connection) => {
    const test = await connection.one(getTestByID(id))
    const parts = await connection.any(getTestPartsAndGroupsByTestID(id))

    if (parts.length === 0 || parts.some(p => p.test_status === 'scheduled')) {
      return ctx.render('tests/loading')
    }

    const groups = parts.reduce(
      (acc, next) => {
        if (!acc[next.group_key]) {
          const group = {
            key: next.group_key,
            status: next.group_status,
            is_passed: next.group_is_passed,
            tests: []
          }
          acc[group.key] = group
        }
        acc[next.group_key].tests.push({
          key: next.test_key,
          status: next.run_status,
          is_passed: next.test_is_passed,
          title: next.test_title,
          description: next.test_description
        })
        return acc
      },
      {}
    )

    const domain = await connection.one(getDomainByID(test.domain_id))
    await ctx.render('tests/show', {test, domain, groups, md: require('markdown-it')()})
  })
}

module.exports = {createTest, showTest}