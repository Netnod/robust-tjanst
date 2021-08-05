require('dotenv').config()

const path = require('path')
const {pathToFileURL} = require('url')

const Koa = require('koa')
const KoaLogger = require('koa-logger')
const router = require('@koa/router')()
const views = require('koa-views')

const runChecks = require('./checks')

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

router.get('/', async (ctx) => {
  await ctx.render('index')
})

router.get('/test', async (ctx, next) => {
  const {domain} = ctx.request.query
  if (!domain) res.status(403).send("Booo!")

  const json = await runChecks(domain)
    .then(
      result => result,
      err => err
    )
    .then(obj => JSON.stringify(obj, null, 2))

  await ctx.render('test', {domain, json})
})

router.get('/sigil/:domain/text.svg', async (ctx, next) => {
  const {domain} = ctx.request.params
  if (!domain) throw "Boo"

  ctx.set('Content-Type', 'image/svg+xml')
  ctx.set("Content-Dispositon","attachment; filename=" + "sigil.svg")


  const result = await runChecks(domain)
  const fullScore = Object.values(result).every(value => value === true)
  const score = fullScore ? 'good': 'bad'

  ctx.body = `
      <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
        <style>
          .small { font: italic 13px sans-serif; }
          .heavy { font: bold 30px sans-serif; }
      
          /* Note that the color of the text is set with the    *
          * fill property, the color property is for HTML only */
          .bad { font: italic 40px serif; fill: red; }
          .good { font: italic 40px serif; fill: green; }
        </style>
      
        <text x="20" y="35" class="small">My</text>
        <text x="40" y="35" class="heavy">site</text>
        <text x="55" y="55" class="small">is</text>
        <text x="65" y="55" class="${score}">${score === 'good' ? 'Robust!' : 'Bad!'}</text>
      </svg>
    `
})


app.use(router.routes())

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`)
})