const { upsertDomain, getDomainByDomainName } = require("./db/queries/domains")
const sigilSuccessLarge = require('./assets/robust-badge--large--success--BETA')
const sigilSuccessSmall = require('./assets/robust-badge--small--success--BETA')
const sigilFailLarge = require('./assets/robust-badge--large--fail--BETA')
const sigilFailSmall = require('./assets/robust-badge--small--fail--BETA')
const { sql } = require("slonik")
const { Queue } = require('bullmq')
const IORedis = require('ioredis')
const parseUrl = require("./lib/parseUrl")
const redis = new IORedis(process.env.REDIS_URL)
const testQueue = new Queue('run_tests', {connection: redis})

const fileChoice = {
  true: {
    'large': sigilSuccessLarge,
    'small': sigilSuccessSmall,
  },
  false: {
    'large': sigilFailLarge,
    'small': sigilFailSmall,
  }
}

// TODO: It would be prudent to have an index or two in place here.
//       This query may be doing 2-3 table scans!
function getLatestValidTestResult(domain_id) {
  return sql`
    SELECT EVERY((test_results.test_output -> 'passed')::boolean) AS passed
    FROM test_runs tr
    INNER JOIN test_results ON test_results.test_run_id = tr.id
    WHERE tr.domain_id = ${domain_id}
    GROUP BY tr.id
    HAVING
      EVERY(test_results.execution_status = 'completed') IS TRUE
    ORDER BY tr.created_at DESC
    LIMIT 1
  `
}

// makes sure we only run a function one time per domain using a semaphore in redis
async function runOnlyOncePerDomain(domain, fn, timeout = 300000) {
  const key = `sigil:${domain}:test_running`
  const semaphore = await redis.get(key)
  if (semaphore) return false // do nothing if we are already running the test

  // add key to redis with 5 minute ttl and run the test
  await redis.set(key, 'running', 'EX', timeout / 1000)
  await fn()
  // delete the key
  await redis.del(key)
  await redis.del(`sigil:${domain}:result`) // also remove old cached result
  return true
}


async function runAndCache(domain, fn, ttl = 5 * 60 * 60) {
  const key = `sigil:${domain}:result`
  const cache = await redis.get(key)
  if (cache) return cache 
  const result = await fn()

  await redis.set(key, JSON.stringify(result), 'EX', ttl)
  return result
}

async function createAndWaitForTest(domain, connection) {
  await runOnlyOncePerDomain(domain, async () => {
    console.log('Running test for domain from sigil', domain)
    const parsedUrl = parseUrl(`https://${domain}`)
    const test_run_id = await connection.transaction(async (trx) => {
      const {domain_id} = await trx.one(upsertDomain(parsedUrl.host))
      const {test_run_id} = await trx.one(insertNewTestRun(domain_id))
      return test_run_id
    })
    await testQueue.add('Test run request', {test_run_id, arguments: parsedUrl})

    await testQueue
      .add('Test run request from sigil', {test_run_id, arguments: domain})
      .waitUntilFinished() // todo: when this happens we should send a 'test running... svg'
  })
}

// this is cached for hours to avoid overload and when the cache is empty,
// we will schedule a new fresh result and schedule a new test
async function getSigil(ctx) {
  const {domain, type} = ctx.request.params
  const passed = await runAndCache(domain, async () => {

    const pool = ctx.dbPool
    const {passed} = await pool.connect(async conn => {
      await createAndWaitForTest(domain, conn)
      const {id: domain_id} = await conn.one(getDomainByDomainName(domain))
      return await conn.one(getLatestValidTestResult(domain_id))
    })
    return passed
  })
  const svg = fileChoice[passed][type]
  ctx.body = svg
  ctx.type = 'image/svg+xml'
  ctx.set("Content-Dispositon","attachment; filename=" + "sigil.svg")
}

module.exports = {getSigil}
