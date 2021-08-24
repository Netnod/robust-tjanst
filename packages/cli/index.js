'use strict'
const importJsx = require('import-jsx')
process.env.FORCE_COLOR = 1

const {Engine} = require('engine')

const engine = new Engine()

importJsx('./UI.jsx')(engine)
