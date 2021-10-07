const { Queue } = require('bullmq')
const workers = require('./tests')

const connection = {
  host: process.env.REDIS_URL || 'localhost',
  port: process.env.REDIS_PORT || 6379,
}

module.exports = {
  connection,
  workers,
  queues: Object.keys(workers).reduce(
    (acc, queue) => ({...acc, [queue]: new Queue('dns', {connection})}),
    {}
  )
}

// example usage:
//
// const {queues: {dns}} = require('tests')
// dns.add('DNS: www.iteam.se', {url: 'https://www.iteam.se'})