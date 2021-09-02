const { sql } = require('slonik')
const {
  getTopDomains, 
  getDomainsForAccount, 
  getDomainForAccountByURL, 
  getDomainByID,
  insertDomain, 
  associateAccountWithDomain,
  getTestHistoryForDomain,
} = require('./db/queries/domains')

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

  const json = JSON.stringify({ipv4_dig: false}, null, 2)

  await ctx.render('domains/check', {domain, json})
}

async function getMine(ctx) {
  await ctx.dbPool.connect(async (connection) => {
    const account_id = ctx.state.user.id

    // TODO: Include status from latest test
    const domains = await connection.any(getDomainsForAccount(account_id))

    if (domains.length === 0)
      return await ctx.render('domains/create_first', {url: ''})

    await ctx.render('domains/mine', {domains})
  })
}

async function createDomain(ctx) {
  const {url} = ctx.request.body
  const account_id = ctx.state.user.id

  // 1. TODO: Validate that this is a valid URL with whatever additional checks
  //   NO: -> await ctx.render('domains/create' (or create_first.. depending), {url})
  await ctx.dbPool.connect(async (connection) => {
    const domain = await connection.maybeOne(getDomainForAccountByURL(account_id, url))
    if (domain) {
      ctx.redirect(ctx.state.namedPath('domain_page', {id: domain.id}))
      return
    }

    await connection.transaction(async (trx) => {
      const domain_id = await trx.maybeOneFirst(insertDomain(url))
      await trx.query(associateAccountWithDomain(account_id, domain_id))
      console.log({domain_id, url})
      ctx.redirect(ctx.state.namedPath('domain_page', {id: domain_id}))
    })
  })
}

async function showDomain(ctx) {
  const {id} = ctx.params
  const account_id = ctx.state.user.id

  // 1. TODO: Validate that this is a valid URL with whatever additional checks
  //   NO: -> await ctx.render('domains/create' (or create_first.. depending), {url})
  // TODO: Validate that this domain belongs to this account?
  await ctx.dbPool.connect(async (connection) => {
    const domain = await connection.one(getDomainByID(id))
    const history = await connection.any(getTestHistoryForDomain(id))

    console.log({domain, history})
    await ctx.render('domains/show', {domain, history})
  })
}

async function getNew(ctx) {
  await ctx.render('domains/new')
}

module.exports = {listTopDomains, getCheck, getMine, createDomain, showDomain, getNew}