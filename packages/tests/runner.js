const { Worker } = require('bullmq')
const {sql, createPool} = require('slonik')
const {testQueue, resultQueue, testQueues, connection} = require('./index')


require('./tests/tls/worker')(connection, resultQueue)
require('./tests/dns/worker')(connection, resultQueue)

new Worker(testQueue.name, async ({data: {url, test_id}}) => {
  console.log("new test", url)
  await Promise.all([
    testQueues.dns.add(`DNS: ${url}`, {url, test_id}),
    // testQueues.tls.add(`TLS: ${url}`, {url, test_id})
  ])
}, {connection})

const pool = createPool(process.env.DATABASE_URL)

new Worker(resultQueue.name, async ({data}) => {
  console.log("ResultQueue", data)
  const {test_id, label, status, result} = data

  await pool.connect(async (connection) => {
    await connection.any(sql`
      INSERT INTO domain_test_parts (domain_test_id, part_id, test_status, result_pass, result_description)
      VALUES (${test_id}, ${label}, ${status}, ${result.passed || false}, ${result.description || ''})
      ON CONFLICT ON CONSTRAINT domain_test_parts_domain_test_id_part_id_key
      DO UPDATE
        SET 
          test_status=EXCLUDED.test_status,
          result_pass=EXCLUDED.result_pass,
          result_description=EXCLUDED.result_description
          
    `)
  })
})
