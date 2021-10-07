const { Queue } = require('bullmq')

const connection = {
  host: process.env.REDIS_URL || 'localhost',
  port: process.env.REDIS_PORT || 6379,
}

module.exports = {
  connection,
  testQueue: new Queue('run_tests', {connection}),

  testQueues: {
    dns:  new Queue('dns', {connection}),
    tls:  new Queue('tls', {connection}),
  }
}