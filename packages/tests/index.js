const { Queue } = require('bullmq')
const workers = require('./workers')
const queues = require('./queues')

const connection = {
  host: process.env.REDIS_URL || 'localhost',
  port: process.env.REDIS_PORT || 6379,
}

module.exports = {
  workers: workers(connection),
  queues: queues(connection)
}

// example usage:
//
// const {queues: {dns}} = require('tests')
// dns.add('DNS: www.iteam.se', {url: 'https://www.iteam.se'})