const path = require('path')
require('dotenv').config({path: path.join(__dirname, "../.env")})

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
const tests = require('./tests')
const sigil = require('./sigil')
const auth = require('./auth')
const fake = require('./fake')

const { InvalidSessionError } = require('./errors')
const { format } = require('date-fns')

const {BASE_URL, SIGNED_COOKIE_KEYS, NODE_ENV} = process.env

const app = new Koa()

app.use(koaLogger())
app.keys = SIGNED_COOKIE_KEYS.split(',')
app.use(koaSession({}, app))

app.on('error', (err, ctx) => {
  // TODO: Sentry or some other error reporting
  console.error(err)
})

// Unhandled exceptions
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (err instanceof InvalidSessionError) {
      ctx.session = null
      // TODO: Add flash message explaining what happened
      ctx.redirect('/')
      return
    }

    ctx.status = 500
    console.log(err)
    if (NODE_ENV === 'production') {
      ctx.body = 'Internal Server Error'
    } else {
      ctx.body = `
        <h1>${err.name}</h1>

        <pre>
          ${err.stack}
        </pre>
      `
      ctx.app.emit('error', err, ctx)
    }
  }
})

app.use(koaViews(
  path.join(__dirname, './views'), {
    map: {pug: 'pug'},
    extension: 'pug',
  }
))

app.use(passport.initialize())
app.use(passport.session())

// Provide `ctx.dbPool` for routes
app.context.dbPool = dbPool

const router = new KoaRouter()

router.get(
  '/_health_check',
  async (ctx) => {
    await dbPool.connect()
    ctx.body = 'OK'
  }
)

// --- TO BE REMOVED
router.get(
  '/', 
  async (ctx) => {
    if (ctx.isAuthenticated())
      await ctx.render('index')
    else 
      await ctx.render('landing')
      // ctx.redirect('/login')
  }
)
router.get('/test', ctx => {
  const {domain} = ctx.request.query
  ctx.redirect(router.url('test_domain', {domain: encodeURIComponent(domain)}))

})
// ----------------- // 

router.get('top_domains', '/domains/top', domains.listTopDomains)
router.get('test_domain', '/domains/test/:domain', domains.getCheck)
router.get('my_domains', '/domains/mine', domains.getMine)
router.get('new_domain', '/domains/new', domains.getNew)
router.post('create_domain', '/domains', koaBody(), domains.createDomain)
router.get('domain_page', '/domain/:id', domains.showDomain)

router.post('create_test', '/test', koaBody(), tests.createTest)
router.get('test_page', '/test/:id', tests.showTest)

router.get('domain_sigil', '/sigil/:domain/text.svg', sigil.getSigil)

// TODO: Auth check & enforce
router.get('register', '/accounts/new', accounts.newAccount)
router.post('create_account', '/accounts', koaBody(), accounts.createAccount)

router.get('login', '/login', auth.getLogin)
router.post('/login', koaBody(), auth.createLogin)
router.get('logout', '/logout', auth.destroyLogin)

router.get('fake_test', '/results', fake.test)



// Template helpers. These functions are callable inside views
app.use(async (ctx, next) => {
  ctx.state.absolutePath = (relativePath) => {
    return new URL(relativePath, BASE_URL).toString()
  }

  ctx.state.namedPath = (name, ...args) => {
    // Errors come back as type object, apparently...
    const answer = router.url(name, ...args)
    if (typeof answer === "object") throw answer
    return answer
  }

  ctx.state.namedURL = (name, ...args) => {
    const path = ctx.state.namedPath(name, ...args)
    return new URL(path, BASE_URL).toString()
  }

  ctx.state.formatTimestamp = (ts) => {
    return format(new Date(ts), 'yyyy-MM-dd')
  }

  await next()
})

// Note that this must come after the view helpers for them to be available
// in views rendered by routes
app.use(router.routes())

// TODO: if (NODE_ENV !== 'production')
app.use(require('koa-static')((__dirname + '/../public')))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`)
})
