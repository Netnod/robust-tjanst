const { getLatestResult } = require("./db/queries/domains")
const sigilSuccess = require('./assets/robust-badge--animated.js')
const sigilFail = require('./assets/robust-badge--fail.js')
async function getSigil(ctx) {
  const {domain} = ctx.request.params
  if (!domain) throw "Boo"

  ctx.type = 'image/svg+xml'
  ctx.set("Content-Dispositon","attachment; filename=" + "sigil.svg")

  const pool = ctx.dbPool
  await pool.connect(async conn => {
    // const result = await getLatestResult(conn, domain)
    ctx.body = sigilSuccess
  })

}

module.exports = {getSigil}