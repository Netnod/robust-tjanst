const runChecks = require("./lib/runChecks")

async function getSigil(ctx) {

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
}

module.exports = {getSigil}