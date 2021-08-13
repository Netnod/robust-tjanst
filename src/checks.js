const runChecks = require("./lib/runChecks")

async function getCheck(ctx) {
  const {domain} = ctx.request.params
  if (!domain) throw "Boo!"

  const json = await runChecks(domain)
    .then(
      result => result,
      err => err
    )
    .then(obj => JSON.stringify(obj, null, 2))

  await ctx.render('checks/result', {domain, json})
}


module.exports = {getCheck}