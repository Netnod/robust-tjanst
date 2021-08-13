require('dotenv').config()

const path = require('path')
const {pathToFileURL} = require('url')
const {createPool} = require('slonik')

const Koa = require('koa')
const KoaLogger = require('koa-logger')
const KoaRouter = require('@koa/router')
const views = require('koa-views')
const koaBody = require('koa-body')

const accounts = require('./accounts')
const domains = require('./domains')
const sigil = require('./sigil')
const checks = require('./checks')

const {BASE_URL} = process.env

const app = new Koa()
app.use(KoaLogger())
app.use(views(
  path.join(__dirname, './views'), {
    map: {pug: 'pug'},
    extension: 'pug',
  }
))

app.use(async (ctx, next) => {
  // Helpers for pug templates
  // TODO: use URL
  ctx.state.absolutePath = (relativePath) => {
    return new URL(relativePath, BASE_URL).toString()
  }

  await next()
})


const dbPool = createPool(process.env.DATABASE_URL)

app.context.dbPool = dbPool

const router = new KoaRouter()
// --- TO BE REMOVED
router.get('/', async (ctx) => {
  await ctx.render('index')
})
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

app.use(router.routes())


app.use(require('koa-static')((__dirname + '/../public')))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`)
})