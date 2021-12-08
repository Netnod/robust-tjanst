const { compare } = require("bcrypt");
const passport = require("koa-passport");
const LocalStrategy = require("passport-local");
const { sql } = require("slonik");

const dbPool = require("../db");
const { findAccount } = require("../db/queries/auth");
const { InvalidSessionError } = require("../errors");


// The first argument is passed by the strategy
passport.serializeUser((id, done) => {
  done(null, {id})
})

// The first argument is "passed by" the serializer ^
passport.deserializeUser((serialized, done) => {
  const {id} = serialized
  dbPool.connect(async (conn) => {
    const exists = await conn.maybeOne(sql`SELECT 1 FROM accounts WHERE id = ${id}`)
    if (exists) {
      done(null, serialized)
    } else {
      // TODO: Should result in a redirect to the login page
      // and a message about having been logged out
      done(new InvalidSessionError("No user with ID exists"), false)
    }
  })
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