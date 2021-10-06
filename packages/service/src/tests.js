const { sql } = require('slonik')
const { getDomainByID } = require('./db/queries/domains')
const { getTestByID, getTestPartsByTestID } = require('./db/queries/tests')


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
    RETURNING id
  `
}

async function createTest(ctx) {
  // // TODO: Validate URL
  const {url} = ctx.request.body
  // // TODO: "Owned" URLs are perhaps "private"

  // const id = await ctx.dbPool.connect(async (connection) => {
  //   const {domain_id} = await connection.one(upsertURL(url));

  //   const {id} = await connection.one(insertNewTest(domain_id))
  //   return id
  // })
  // ctx.redirect(ctx.state.namedPath('test_page', {url, id}))

  // // K8S: Schedule!
  const domain = {domain_name: url} 
  const parts = [
    {part_id: 'dns', test_status: 'FIN'}
  ]
  await ctx.render('tests/show', {domain, parts})
}

async function showTest(ctx) {
  const {id} = ctx.request.params

  await ctx.dbPool.connect(async (connection) => {
    const test = await connection.one(getTestByID(id))
    const domain = await connection.one(getDomainByID(test.domain_id))
    const parts = await connection.any(getTestPartsByTestID(id))

    await ctx.render('tests/show', {test, domain, parts})
  })
}

module.exports = {createTest, showTest}