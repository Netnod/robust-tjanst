const { Queue } = require('bullmq')
const IORedis = require('ioredis')

const connection = new IORedis(process.env.REDIS_URL)

module.exports = {
  connection,
  testQueue: new Queue('run_tests', {connection}),

  testQueues: {
    dns:  new Queue('dns', {connection}),
    tls:  new Queue('tls', {connection}),
  }
}