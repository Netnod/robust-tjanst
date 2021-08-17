const { compare } = require("bcrypt");
const passport = require("koa-passport");
const LocalStrategy = require("passport-local");

const dbPool = require("../db");
const { findAccount } = require("../db/queries/auth");


passport.serializeUser((id, done) => {
  done(null, id)
})

passport.deserializeUser((id, done) => {
  done(null, id)
})

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async function(email, password, done) {
    dbPool.connect(async (conn) => {
      const account = await findAccount(conn, email)

      if (account && await compare(password, account.password)) {
        return done(null, account.id)
      } else {
        return done(null, false)
      }
    })
  }
))

module.exports = passport