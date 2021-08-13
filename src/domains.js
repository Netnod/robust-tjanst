const {getTopDomains} = require('./db/queries/domains')
const runChecks = require('./lib/runChecks')

async function listTopDomains(ctx) {
  await ctx.dbPool.connect(async (connection) => {
    const domains = await connection.any(getTopDomains())
    await ctx.render(
      'domains/top_domains', 
      {
        pageTitle: "Hall of Fame", 
        domains
      })
  })
}

async function getCheck(ctx) {
  const {domain} = ctx.request.params
  if (!domain) throw "Boo!"

  // const json = await runChecks(domain)
  //   .then(
  //     result => result,
  //     err => err
  //   )
  //   .then(obj => JSON.stringify(obj, null, 2))
  const json = JSON.stringify({ipv4_dig: false}, null, 2)

  await ctx.render('domains/check', {domain, json})
}

module.exports = {listTopDomains, getCheck}