const { Worker } = require('bullmq')
const {sql, createPool} = require('slonik')
const {testRunQueue, resultQueue, testQueues, connection} = require('./index')

const pool = createPool(process.env.DATABASE_URL)

require('./tests/https/worker')(connection, resultQueue)

new Worker(testRunQueue.name, async ({data: {arguments, test_id}}) => {
  console.log("TestRunQueue", {arguments, test_id})
  await Promise.all([
    testQueues.https.add(`HTTPS-REACHABLE: ${arguments.host}`, {arguments, test_id})
  ])
}, {connection})

new Worker(resultQueue.name, async ({data}) => {
  console.log("ResultQueue", data)
  const { test_id, test_name, test_output } = data

  await pool.connect(async (connection) => {
    await connection.any(sql`
      INSERT INTO test_results (test_id, test_name, test_result)
      VALUES (${test_id}, ${test_name}, ${JSON.stringify(test_output)})
    `)
  })
}, {connection})
