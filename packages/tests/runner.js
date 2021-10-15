const { Worker } = require('bullmq')
const {testQueue, testQueues, connection} = require('./index')

require('./tests/tls/worker')(connection)
require('./tests/dns/worker')(connection)


testQueues.dns.clean()

new Worker(testQueue.name, async ({data: {url}}) => {
  await Promise.all([
    testQueues.dns.add(`DNS: ${url}`, {url}),
    testQueues.tls.add(`TLS: ${url}`, {url})
  ])
}, {connection})