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
  {
    name: 'ipv6-dns',
    group: 'dns',
    image: 'netnodse/ipv6-dns:latest',
    messages: './tests/ipv6-dns/messages.js'
  },
  // FIXME: Re-enable this test when we either move to a cluster that supports
  //        ipv6 or get it working on google cloud
  // {
  //   name: 'ipv6-connectivity',
  //   group: 'dns',
  //   image: 'netnodse/ipv6-connectivity:latest',
  //   messages: './tests/ipv6-connectivity/messages.js'
  // }
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
