const { getDomainByDomainName } = require("./db/queries/domains")
const sigilSuccessLarge = require('./assets/robust-badge--large--success--BETA')
const sigilSuccessSmall = require('./assets/robust-badge--small--success--BETA')
const sigilFailLarge = require('./assets/robust-badge--large--fail--BETA')
const sigilFailSmall = require('./assets/robust-badge--small--fail--BETA')
const { sql } = require("slonik")

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

async function getSigil(ctx) {
  const {domain, type} = ctx.request.params

  const pool = ctx.dbPool
  const {passed} = await pool.connect(async conn => {
    const {id: domain_id} = await conn.one(getDomainByDomainName(domain))
    return await conn.one(getLatestValidTestResult(domain_id))
  })
  
  const svg = fileChoice[passed][type]
  ctx.body = svg
  ctx.type = 'image/svg+xml'
  ctx.set("Content-Dispositon","attachment; filename=" + "sigil.svg")
}

module.exports = {getSigil}