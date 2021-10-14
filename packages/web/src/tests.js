const { sql } = require('slonik')
const { getDomainByID } = require('./db/queries/domains')
const { getTestByID, getTestPartsByTestID } = require('./db/queries/tests')
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
    INSERT INTO domain_tests (domain_id)
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

  await ctx.redirect(ctx.state.namedPath('test_page', {url, id: test_id}))
}

async function showTest(ctx) {
  const {id} = ctx.request.params

  await ctx.dbPool.connect(async (connection) => {
    const test = await connection.one(getTestByID(id))
    const parts = await connection.any(getTestPartsByTestID(id))

    if (parts.length === 0 || parts.some(p => p.status === 'scheduled')) {
      return ctx.render('tests/loading')
    }

    const domain = await connection.one(getDomainByID(test.domain_id))
    await ctx.render('tests/show', {test, domain, parts})
  })
}

module.exports = {createTest, showTest}