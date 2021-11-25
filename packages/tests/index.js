// This file is mainly for exposing things out to other services
require('dotenv').config()
const { Queue } = require('bullmq')
const IORedis = require('ioredis')
const { RESULTORS, GROUP_DESCRIPTIONS } = require('./testResultMessages')

const connection = new IORedis(process.env.REDIS_URL)

// TODO: get from test struct below
const GROUPINGS = {
  'https-reachable': 'https',
  'https-redirect': 'https',
  'dnssec-presence': 'dnssec'
}

// message = require(./tests/https/messages)
const tests = [
  // TODO: rename test folder
  { name: 'https-existance', group: 'https' }
]

module.exports = {
  connection,
  testRunQueue: new Queue('run_tests', {connection}),
  resultQueue: new Queue('test_results', {connection}),

  testQueues: {
    // dns:  new Queue('dns', {connection}),
    // tls:  new Queue('tls', {connection}),
    https: new Queue('https', {connection})
  },

  RESULTORS,
  GROUPINGS,
  GROUP_DESCRIPTIONS,
}
