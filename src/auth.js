const passport = require("koa-passport")

async function getLogin(ctx) {
  await ctx.render('auth/login', {login: {email: ''}})
}

function createLogin(ctx) {
  return passport.authenticate('local', {
    failureRedirect: ctx.state.namedPath('login'), 
    successRedirect: '/'}
  )(ctx)
}

async function destroyLogin(ctx) {
  await ctx.logout()
  ctx.redirect('/')
}


module.exports = { getLogin, createLogin, destroyLogin }