const { genSalt, hash } = require('bcrypt');
const koaBody = require('koa-body');
const passport = require('koa-passport');
const { sql, UniqueIntegrityConstraintViolationError } = require("slonik");

async function createNewUser(connection, {name, email, password}) {
  console.log(sql.array([name, email, password]))
  try {
    const {id} = await connection.one(sql`
      INSERT INTO accounts (name, email, password)
      VALUES 
        (${sql.join([name, email, password], sql`, `)})
      RETURNING id
    `)

    return id
  } catch (err) {
    if (err instanceof UniqueIntegrityConstraintViolationError) {
      // TODO: Make me better
      return Promise.reject("That's no good at all")
    }

    throw err
  }
}

const EMPTY_STATE = {
  name: '',
  email: '',
  consent: false
}

Object.freeze(EMPTY_STATE)

module.exports = {
  newAccount: async (ctx) => {
    await ctx.render('accounts/new', {account: EMPTY_STATE})
  },

  createAccount: async (ctx) => {
    const account = ctx.request.body
    // TODO: Validate

    const salt = await genSalt(10)
    const password = await hash(account.password, salt)


    console.log(account)
    const id = await createNewUser(ctx.dbPool, {...account, password})
    await ctx.login(id)
    ctx.redirect('/')

    // return passport.authenticate('local', {
    //   failureRedirect: '/accounts/new',
    //   successRedirect: '/'
    // })(ctx)
  }
}

