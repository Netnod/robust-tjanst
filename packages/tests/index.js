require('dotenv').config()
const { Queue } = require('bullmq')
const IORedis = require('ioredis')

const connection = new IORedis(process.env.REDIS_URL)

module.exports = {
  connection,
  testRunQueue: new Queue('run_tests', {connection}),
  resultQueue: new Queue('test_results', {connection}),

  testQueues: {
    // dns:  new Queue('dns', {connection}),
    // tls:  new Queue('tls', {connection}),
    https: new Queue('https', {connection})
  }
}
