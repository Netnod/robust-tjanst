const { getDomainByDomainName, getLatestTestResult } = require("./db/queries/domains")
const sigilSuccessLarge = require('./assets/robust-badge--large--success--BETA')
const sigilSuccessSmall = require('./assets/robust-badge--small--success--BETA')
const sigilFailLarge = require('./assets/robust-badge--large--fail--BETA')
const sigilFailSmall = require('./assets/robust-badge--small--fail--BETA')

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

async function getSigil(ctx) {
  const {domain, type} = ctx.request.params

  const pool = ctx.dbPool
  const {passed} = await pool.connect(async conn => {
    const {id: domain_id} = await conn.one(getDomainByDomainName(domain))
    return await conn.one(getLatestTestResult(domain_id))
  })
  
  const svg = fileChoice[passed][type]
  ctx.body = svg
  ctx.type = 'image/svg+xml'
  ctx.set("Content-Dispositon","attachment; filename=" + "sigil.svg")
}

module.exports = {getSigil}