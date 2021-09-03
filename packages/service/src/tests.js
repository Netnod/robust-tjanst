const { sql } = require('slonik')
const { getDomainByID } = require('./db/queries/domains')
const { getTestByID, getTestPartsByTestID } = require('./db/queries/tests')
const { scheduleTestRun } = require('./workers/schedule')


async function createTest(ctx) {
  const {domain_id} = ctx.request.body
  // TODO: Verify this is accessible to ctx.state.user_id

  const id = await ctx.dbPool.connect(async (connection) => {
    const {id} = await connection.one(sql`
      INSERT INTO domain_tests (domain_id)
      VALUES (${domain_id}) 
      RETURNING id
    `)

    return id
  })

  ctx.redirect(ctx.state.namedPath('test_page', {id}))
  await scheduleTestRun(id)
}

async function showTest(ctx) {
  const {id} = ctx.request.params

  await ctx.dbPool.connect(async (connection) => {
    const test = await connection.one(getTestByID(id))
    const domain = await connection.one(getDomainByID(test.domain_id))
    const parts = await connection.any(getTestPartsByTestID(id))

    console.log(parts)

    await ctx.render('tests/show', {test, domain, parts})
  })
}

module.exports = {createTest, showTest}