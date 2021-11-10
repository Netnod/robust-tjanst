const { sql } = require('slonik')
const { getDomainByID } = require('./db/queries/domains')
const { getTestByID, getTestPartsAndGroupsByTestID } = require('./db/queries/tests')
const { Queue } = require('bullmq')
const IORedis = require('ioredis')

function upsertHost(domain) {
  return sql`
    INSERT INTO domains (domain_name)
    VALUES (${domain})
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

const GROUPINGS = {
  'https-reachable': 'https',
  'https-redirect': 'https',
  'dnssec-presence': 'dnssec'
}

const RESULTORS = {
  'https-reachable': (domain, result) => {
    const title = result.passed ? "Kan nås med HTTPS" : "Kunde inte nås med HTTPS"
    // TODO: get the tested URL as output from the test instead
    const description = result.passed 
      ? `Kunde nå tjänsten på https://${domain.domain_name}. Bra jobbat!`
      : `Vi kunde inte nå tjänsten på https://${domain.domain_name}. Utan stöd för https kan användare inte vara säkra på att den information som visas är korrekt eller att den information de skickar till er är säker.`
    return {
      passed: result.passed,
      title,
      description
    }
  },
  'https-redirect': (domain, result) => {
    const title = "Automatisk vidarebefordran till HTTPS-versionen"
    // TODO: get the tested URL as output from the test instead
    const description = result.passed
      ? `http://${domain.domain_name} skickade oss automatiskt till https://${domain.domain_name} `
      : `http://${domain.domain_name} borde automatiskt skicka alla besökare till https://${domain.domain_name}, inte erbjuda en osäker version av sidan.`
    return {
      passed: result.passed,
      title,
      description
    }
  },
  'dnssec-presence': (domain, result) => {
    // TODO: implement
    return {
      passed: result.passed,
      title: "DNSSec existans",
      description: "**Tillvägagångssätt:** Vi letar efter domänets SOA record och kollar om det är signerat med DNSSEC",
    }
  }
}

const GROUP_DESCRIPTIONS = {
  'https': (domain, tests) => {
    return {
      title: "HTTPS",
      description: "Säker åtkomst till tjänsten krypterad anslutning",
      result: 
        tests.every(t => t.passed)
        ? "✔️ Kommunikationen är skyddad"
        : "❌ All kommunikation är inte skyddad",
    }
  },
  'dnssec': (domain, tests) => {
    return {
      title: "DNSSEC",
      description: `
        Moderna webbläsare och verktyg vet hur man validerar svar från DNS-servern genom kryptografiska signaturer. 
        Därmed kan webbläsaren vara säker på att svaret inte manipulerats utan kommer från den korrekta källan.
      `,
      result: tests.every(t => t.passed) ? "Allt ser bra ut!" : "En eller flera krav är inte uppnådda."
    }
  }
}

const buildGroups = (domain, results) => {
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
    const fn = RESULTORS[result.test_name]
    if (!fn) throw new Error(`No result function for ${result.test_name}`)
    const group = GROUPINGS[result.test_name]
    if (!group || !groups[group]) throw new Error(`No group for ${result.test_name}`)
    groups[group].tests.push(fn(domain, result.test_result))
  }

  for (const group of Object.keys(groups)) {
    Object.assign(groups[group], GROUP_DESCRIPTIONS[group](domain, groups[group].tests))
  }

  return groups
}

async function createTest(ctx) {
  function parseUrl(url) {
    const urlWithProto = /^.+(?::\/\/).+$/.test(url) ? url : `http://${url}`
    const parsed = new URL(urlWithProto) // Will throw if unable to parse

    if (parsed.host === '' || parsed.hostname === '') {
      throw new Error(`Could not parse url ${urlWithProto}`)
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Unsupported protocol ${parsed.protocol}`)
    }

    // TODO: somehow make sure we don't allow localhost, 127.0.0.1 etc
    // TODO: block certain ports?
    return {
      host: parsed.host, // 'example.com:8080'
      pathname: parsed.pathname, // '/pages/foobar'
      hostname: parsed.hostname, // 'example.com'
      protocol: parsed.protocol // 'http:' mind the colon
    }
  }

  const parsedUrl = parseUrl(ctx.request.body.url)

  const test_id = await ctx.dbPool.connect(async (connection) => {
    // TODO: Transaction?
    const {domain_id} = await connection.one(upsertHost(parsedUrl.host))
    const {test_id} = await connection.one(insertNewTest(domain_id))
    const job = await testQueue.add('Test run request', {test_id, arguments: parsedUrl})

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
    if (parts.length === 0) { return ctx.render('tests/loading') }

    const domain = await connection.one(getDomainByID(test.domain_id))
    const groups = buildGroups(domain, parts.concat(
      // We don't have implementations of these tests yet
      {test_name: 'https-redirect', test_result: {passed: false}},
      {test_name: 'dnssec-presence', test_result: {passed: true}},
    ))
    await ctx.render('tests/show', {test, domain, groups, md: require('markdown-it')()})
  })
}

module.exports = {createTest, showTest}
