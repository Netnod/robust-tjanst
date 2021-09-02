async function test(ctx) {
  const {domain} = ctx.request.params

  await ctx.render('fake/test', {domain})
}

module.exports = { test }