const { Worker } = require('bullmq')
const {sql, createPool} = require('slonik')
const {testRunQueue, resultQueue, testQueues, connection} = require('./index')
const { startTest, deleteTest } = require('./lib/kubernetes')

const https = require('./tests/https')
const pool = createPool(process.env.DATABASE_URL)

new Worker(testRunQueue.name, async ({data: {url, test_id}}) => {
  await Promise.all([
    testQueues.https.add(`HTTPS-REACHABLE: ${url}`, {url, test_id})
  ])
}, {connection})

new Worker(resultQueue.name, async ({data}) => {
  console.log("ResultQueue", data)
  const { test_id, testName, result } = data

  await pool.connect(async (connection) => {
      await connection.any(sql`
        INSERT INTO test_results (test_id, test_name, test_result)
        VALUES (${test_id}, ${testName}, ${result})
      `)
  })
})
