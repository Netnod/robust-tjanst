require('dotenv').config()

const path = require('path')

const Koa = require('koa')
const KoaRouter = require('@koa/router')
const koaLogger = require('koa-logger')
const koaViews = require('koa-views')
const koaBody = require('koa-body')
const koaSession = require('koa-session')

const dbPool = require('./db')

const passport = require('./middleware/auth')

const accounts = require('./accounts')
const domains = require('./domains')
const sigil = require('./sigil')
const auth = require('./auth')

const {BASE_URL, SIGNED_COOKIE_KEYS} = process.env

const app = new Koa()

app.keys = SIGNED_COOKIE_KEYS.split(',')
app.use(koaSession({}, app))

app.use(koaLogger())

app.use(koaViews(
  path.join(__dirname, './views'), {
    map: {pug: 'pug'},
    extension: 'pug',
  }
))

app.use(passport.initialize())
app.use(passport.session())

app.use(async (ctx, next) => {
  // Helpers for pug templates. They are callable functions inside views
  ctx.state.absolutePath = (relativePath) => {
    return new URL(relativePath, BASE_URL).toString()
  }

  await next()
})



app.context.dbPool = dbPool

const router = new KoaRouter()
// --- TO BE REMOVED
router.get(
  '/', 
  async (ctx) => {
    if (ctx.isAuthenticated())
      await ctx.render('index')
    else 
      ctx.redirect('/login')
  }
)
router.get('/test', ctx => {
  const {domain} = ctx.request.query
  ctx.redirect(`/domains/test/${domain}`)

})
// ----------------- // 

router.get('/domains/top', domains.listTopDomains)
router.get('/domains/test/:domain', domains.getCheck)

router.get('/sigil/:domain/text.svg', sigil.getSigil)

router.get('/accounts/new', accounts.newAccount)
router.post('/accounts', koaBody(), accounts.createAccount)

router.get('/login', auth.getLogin)
router.post('/login', koaBody(), auth.createLogin)
router.get('/logout', auth.destroyLogin)

app.use(router.routes())

// TODO: if (NODE_ENV !== 'production')
app.use(require('koa-static')((__dirname + '/../public')))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`)
})