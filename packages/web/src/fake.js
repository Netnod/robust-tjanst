async function test(ctx) {
  const {url} = ctx.request.query

  await ctx.render('fake/test', {url})
}

module.exports = { test }