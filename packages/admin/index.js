const express = require('express')
const { Queue } = require('bullmq')
const { createBullBoard } = require('@bull-board/api')
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter')
const { ExpressAdapter } = require('@bull-board/express')
const tests = require('tests')

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('')

const options = { readOnlyMode: true }
createBullBoard({
  queues: Object.values(tests.testQueues)
    .map(queue => new BullMQAdapter(queue, options))
    .concat([new BullMQAdapter(tests.testQueue, options)]),
  serverAdapter: serverAdapter
})

const app = express()

app.use('/', serverAdapter.getRouter())
app.listen(process.env.PORT || 4567)

