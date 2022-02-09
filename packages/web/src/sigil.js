const { getDomainByDomainName } = require("./db/queries/domains")
const sigilSuccessLarge = require('./assets/robust-badge--large--success--BETA')
const sigilSuccessSmall = require('./assets/robust-badge--small--success--BETA')
const sigilFailLarge = require('./assets/robust-badge--large--fail--BETA')
const sigilFailSmall = require('./assets/robust-badge--small--fail--BETA')
const { sql, DataIntegrityError, NotFoundError } = require("slonik")

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
    SELECT 
      EVERY((test_results.test_output -> 'passed')::boolean) AS passed,
      tr.created_at
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

const CACHE_TIME_S = (60 * 60 * 4)
const CACHE_TIME_MS = CACHE_TIME_S * 1000
const CACHE_WAIT_FOR_TEST_S = (60 * 5)

/*
 * These scenarios need to be considered
 * 1. There is no available test run for this domain
 * 2. There is an outdated (created_at >= CACHE_TIME) test run
 * 3. There is a fresh test (created_at < CACHE_TIME) test run
 * 
 * See getLatestValidTestResult for the definition of a valid test result
 * 
 * In each scenario we need to schedule a test and set Cache-Control: maxage=<s> like so:
 * 1. Don't schedule, return a 404,             cache for 5min
 * 2. Schedule test,  return the last result,   cache for 5min
 * 3. Don't schedule, return the result,        cache for remaining life time
 * 
 * Scheduling a test involves a Redis semaphore so that we avoid scheduling more than one.
 * 
 * The reason we don't schedule in scenario 1 is that we expect the user to go through
 * at least a manual testing to "register" the domain and grab the sigil URL,
 * and there is actual user & domain registration planned as well.
 * 
 * The reason for the 5min cache in scenario 1 is that we may have a test running.
 */
async function getSigil(ctx) {
  const {domain, type} = ctx.request.params

  const pool = ctx.dbPool

  const latest_test = await pool.connect(async conn => {
    try {
      const {id: domain_id} = await conn.one(getDomainByDomainName(domain))
      return await conn.one(getLatestValidTestResult(domain_id))
    } catch (err) {
      // Thrown by conn.one indicating we are at scenario 1
      if (err instanceof DataIntegrityError || err instanceof NotFoundError) {
        return null
      }
      throw err
    }
  })

  // Scenario 1
  if (!latest_test) {
    ctx.set("Cache-Control", `maxage=${CACHE_WAIT_FOR_TEST_S}`)
    ctx.status(404)
    return    
  }

  const {passed, created_at} = latest_test
  const now = new Date()
  const test_date = new Date(created_at)
  const test_age_ms = now - test_date

  if (test_age_ms > CACHE_TIME_MS) {
    // Scenario 2
    // TODO: Schedule test
    console.log("we need a nuuuuw test")
    ctx.set("Cache-Control", `maxage=${CACHE_WAIT_FOR_TEST_S}`)
  } else {
    // Scenario 3
    const ttl_ms = CACHE_TIME_MS - test_age_ms
    console.log("Scenario 3", test_age_ms / 1000, ttl_ms / 1000) 
    ctx.set("Cache-Control", `maxage=${ttl_ms * 1000}`)
  }
  
  
  const svg = fileChoice[passed][type]
  ctx.body = svg
  ctx.type = 'image/svg+xml'
  ctx.set("Content-Dispositon","attachment; filename=" + "sigil.svg")
}

module.exports = {getSigil}