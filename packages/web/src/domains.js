const { sql } = require('slonik')
const {
  getTopDomains, 
  getDomainsForAccount, 
  getDomainForAccountByURL, 
  insertDomain, 
  associateAccountWithDomain,
} = require('./db/queries/domains')


function getDomainByDomainName(domain_name) {
  return sql`
    SELECT
      d.id,
      d.domain_name,
      d.created_at 
    FROM domains d 
    WHERE d.domain_name = ${domain_name}
  `
}

function getLastTestResultForDomain(domain_id) {
  return sql`
    WITH last_test AS (
      SELECT tr.id, tr.created_at
      FROM test_runs tr
      WHERE tr.domain_id = ${domain_id}
      ORDER BY tr.created_at DESC
      LIMIT 1
    )

    SELECT last_test.id, last_test.created_at, 
           bool_and((t.test_output -> 'passed')::boolean) as passed
    FROM last_test
    INNER JOIN test_results t ON (t.test_run_id = (SELECT id FROM last_test LIMIT 1))
    GROUP BY last_test.id, last_test.created_at; 
  `
}

function getTestHistoryForDomain(domain_id, exclude_test_ids = []) {
  return sql`
    SELECT tr.id, tr.created_at,
           bool_and((t.test_output -> 'passed')::boolean) as passed
    FROM test_runs tr
    INNER JOIN test_results t ON (t.test_run_id = tr.id)
    WHERE domain_id = ${domain_id}
    AND tr.id != ALL(${sql.array(exclude_test_ids, 'int8')})
    GROUP BY tr.id, tr.created_at
    ORDER BY tr.created_at DESC
    LIMIT 50
  `
}


async function getCheck(ctx) {
  const {domain} = ctx.request.params
  if (!domain) throw "Boo!"

  const json = JSON.stringify({ipv4_dig: false}, null, 2)

  await ctx.render('domains/check', {domain, json})
}

async function showDomain(ctx) {
  const {id: domain_name} = ctx.params

  // 1. TODO: Validate that this is a valid URL with whatever additional checks
  //   NO: -> await ctx.render('domains/create' (or create_first.. depending), {url})
  // TODO: Validate that this domain belongs to this account?
  await ctx.dbPool.connect(async (connection) => {
    const domain = await connection.one(getDomainByDomainName(domain_name))
    const last_test = await connection.maybeOne(getLastTestResultForDomain(domain.id))
    const history = await connection.any(getTestHistoryForDomain(domain.id, last_test ? [last_test.id] : []))

    console.log({domain, last_test, history})
    const formattedHistory = history.map((data) => {
      return Object.assign(data, {
        created_at: new Date(data.created_at).toISOString().split('T')[0],
      })
    })
    await ctx.render('domains/show', {
      domain,
      last_test,
      history: formattedHistory,
    })
  })
}

module.exports = {getCheck, showDomain}