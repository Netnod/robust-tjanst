const express = require('express')
const { createBullBoard } = require('@bull-board/api')
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter')
const { ExpressAdapter } = require('@bull-board/express')
const tests = require('tests')

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('')

createBullBoard({
  queues: Object.values(tests).map(queue => new BullMQAdapter(queue)),
  serverAdapter: serverAdapter
})

const app = express()
app.use('/', serverAdapter.getRouter())
app.listen(process.env.PORT || 4567)

