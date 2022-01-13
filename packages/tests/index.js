// This file is mainly for exposing things out to other services
require('dotenv').config()
const { Queue } = require('bullmq')
const IORedis = require('ioredis')
const GROUP_DESCRIPTIONS = require('./groupMessages')

const connection = new IORedis(process.env.REDIS_URL)

const tests = [
  {
    name: 'https-existance',
    group: 'https',
    image: 'netnodse/https-reachable:latest',
    messages: './tests/https/messages.js'
  },
  {
    name: 'hsts',
    group: 'https',
    image: 'netnodse/hsts:latest',
    messages: './tests/hsts/messages.js'
  },
  {
    name: 'zonemaster',
    group: 'dns',
    image: 'netnodse/dns-zonemaster:latest',
    messages: './tests/zonemaster/messages.js'
  },
]

const RESULTORS = tests.reduce((acc, test) => ({
  ...acc,
  [test.name]: require(test.messages)
}), {})

const GROUPINGS = tests.reduce((acc, test) => ({
  ...acc,
  [test.name]: test.group
}), {})

module.exports = {
  tests,
  connection,

  testRunQueue: new Queue('run_tests', {connection}),
  resultQueue: new Queue('test_results', {connection}),
  testQueues: tests.map(test => new Queue(test.name, {connection})),

  RESULTORS,
  GROUPINGS,
  GROUP_DESCRIPTIONS,
}
