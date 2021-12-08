const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const next = require('next')
const Koa = require('koa')
const Router = require('@koa/router')
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

const { BASE_URL, SIGNED_COOKIE_KEYS, NODE_ENV } = process.env

// Initialize KoaJs server and router

// Initialize NextJs instance and expose request handler
const nextApp = next({ dev: true })
const handler = nextApp.getRequestHandler()

nextApp.prepare().then(async () => {
  const server = new Koa()
  const router = new Router()
  try {
    await nextApp.prepare()
    // router.get('/custom-page', async (ctx) => {
    //   await nextApp.render(ctx.req, ctx.res, '/handleComponent', ctx.query)
    //   ctx.respond = false
    // })

    // Unhandled exceptions
    server.use(koaLogger())
    server.keys = SIGNED_COOKIE_KEYS.split(',')
    server.use(koaSession({}, server))

    server.on('error', (err, ctx) => {
      // TODO: Sentry or some other error reporting
      console.error(err)
    })

    server.use(async (ctx, next) => {
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

    server.use(koaViews(path.join(__dirname, './pages')))

    server.use(passport.initialize())
    server.use(passport.session())

    server.context.dbPool = dbPool

    router.get('/_health_check', async (ctx) => {
      await dbPool.connect()
      ctx.body = 'OK'
    })

    router.all('(.*)', async (ctx) => {
      await handler(ctx.req, ctx.res)
      ctx.respond = false
    })
    // router.get('/', async (ctx) => {
    //   if (ctx.isAuthenticated()) await handler(ctx.req, ctx.res)
    //   else await handler(ctx.req, ctx.res)
    //   // ctx.redirect('/login')
    // })
    // --- TO BE REMOVED
    // router.get('/', async (ctx) => {
    //   if (ctx.isAuthenticated()) await ctx.render('index')
    //   else await ctx.render('landing')
    //   // ctx.redirect('/login')
    // })
    // router.get('/test', (ctx) => {
    //   const { domain } = ctx.request.query
    //   ctx.redirect(
    //     router.url('test_domain', { domain: encodeURIComponent(domain) })
    //   )
    // })
    // ----------------- //

    // router.get('top_domains', '/domains/top', domains.listTopDomains)
    // router.get('test_domain', '/domains/test/:domain', domains.getCheck)
    // router.get('my_domains', '/domains/mine', domains.getMine)
    // router.get('new_domain', '/domains/new', domains.getNew)
    // router.post('create_domain', '/domains', koaBody(), domains.createDomain)
    // router.get('domain_page', '/domain/:id', domains.showDomain)

    // router.post('create_test', '/test', koaBody(), tests.createTest)
    // router.get('test_page', '/test/:id', tests.showTest)

    // router.get('domain_sigil', '/sigil/:domain/text.svg', sigil.getSigil)

    // // TODO: Auth check & enforce
    // router.get('register', '/accounts/new', accounts.newAccount)
    // router.post(
    //   'create_account',
    //   '/accounts',
    //   koaBody(),
    //   accounts.createAccount
    // )

    // router.get('login', '/login', auth.getLogin)
    // router.post('/login', koaBody(), auth.createLogin)
    // router.get('logout', '/logout', auth.destroyLogin)

    // router.get('fake_test', '/results', fake.test)

    server.use(async (ctx, next) => {
      ctx.state.absolutePath = (relativePath) => {
        return new URL(relativePath, BASE_URL).toString()
      }

      ctx.state.namedPath = (name, ...args) => {
        // Errors come back as type object, apparently...
        const answer = router.url(name, ...args)
        if (typeof answer === 'object') throw answer
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

    server.use(router.routes())
    server.use(require('koa-static')(__dirname + '/../public'))
    server.listen(3000, (_) => console.log('App running on port 3000'))
  } catch (e) {
    console.error(e)
    process.exit()
  }
})
