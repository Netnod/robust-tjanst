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
    messages: './tests/https/messages'
  },
  {
    name: 'https-redirect',
    group: 'https',
    image: null, // this is mocked
    messages: './mockedHttpRedirectMessages'
  },
  {
    name: 'dnssec-presence',
    group: 'dns',
    image: null, // this is mocked
    messages: './mockedDnsSecPresenceMessages'
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
