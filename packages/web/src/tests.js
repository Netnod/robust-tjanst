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

const buildGroups = (url) => [
  {
    title: "HTTPS",
    description: "Säker åtkomst till tjänsten genom moderna krypteringsalgoritmer.",
    result: "Några av de krav vi stället har inte uppnåtts.",
    tests: [
      {
        title: "Kan nås med HTTPs",
        description: `Vi prövade att nå tjänsten på https://${url}. Den kom vi åt hur bra som helst!`,
        passed: true,
      }, {
        title: "Användaren vidarebefordras automatiskt till den säkra versionen",
        passed: false,
        description: `Vi förväntar oss att bli automatiskt skickade till den säkra versionen. Istället fick vi en osäker version som svar. Det gillar vi **inte**.`,
      }
    ]
  },
  {
    title: "DNSSEC",
    description: `
      Moderna webbläsare och verktyg vet hur man validerar svar från DNS-servern genom kryptografiska signaturer. 
      Därmed kan webbläsaren vara säker på att svaret inte manipulerats utan kommer från den korrekta källan.
    `,
    result: "Allt ser bra ut!",
    tests: [
      {
        title: "DNSSEC existans",
        description: "**Tillvägagångssätt:** Vi letar efter domänets SOA record och kollar om det är signerat med DNSSEC",
        passed: true,
      }
    ]
  }
]

async function createTest(ctx) {
  // // TODO: Validate URL
  const {url} = ctx.request.body
  // // TODO: "Owned" URLs are perhaps "private"

  const test_id = await ctx.dbPool.connect(async (connection) => {
    // TODO: Transaction?
    const {domain_id} = await connection.one(upsertURL(url))
    const {test_id} = await connection.one(insertNewTest(domain_id))
    const job = await testQueue.add('Test run request', {test_id, url})

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

    console.log(parts)

    if (parts.length === 0) {
      return ctx.render('tests/loading')
    }


    const domain = await connection.one(getDomainByID(test.domain_id))
    const groups = buildGroups(domain.domain_name)
    await ctx.render('tests/show', {test, domain, groups, md: require('markdown-it')()})
  })
}

module.exports = {createTest, showTest}
