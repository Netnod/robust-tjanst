const Router = require('@koa/router');
const koaBody = require('koa-body')
const { sql, UniqueIntegrityConstraintViolationError } = require("slonik");

async function createNewUser(connection, payload) {
  try {
    const {id} = await connection.one(sql`
      INSERT INTO accounts (name, email)
      VALUES (${payload.name}, ${payload.email})
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
    const account = ctx.request.body?.account
    // TODO: Validate

    await createNewUser(ctx.dbPool, account)
    await ctx.render('accounts/new', {account})
  }
}

