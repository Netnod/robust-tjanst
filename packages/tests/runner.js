const { Worker } = require('bullmq')
const {sql, createPool} = require('slonik')
const {tests, testRunQueue, resultQueue, testQueues, connection} = require('./index')

const pool = createPool(process.env.DATABASE_URL)

tests.forEach(test => {
  if (test.image) { // TODO: remove when we stop having mocked tests
    require('./testWorker')(test.name, test.image, connection, resultQueue)
  }
})

new Worker(testRunQueue.name, async ({data: {arguments, test_run_id}}) => {
  console.log("TestRunQueue", {arguments, test_run_id})
  await Promise.all(
    testQueues.map(tq =>
        tq.add(`${arguments.host}`, {arguments, test_run_id})
    )
  )
}, {connection})

new Worker(resultQueue.name, async ({data}) => {
  console.log("ResultQueue", data)
  const { test_run_id, test_name, test_output } = data

  await pool.connect(async (connection) => {
    await connection.any(sql`
      INSERT INTO test_results (test_run_id, test_name, test_output)
      VALUES (${test_run_id}, ${test_name}, ${JSON.stringify(test_output)})
    `)
  })
}, {connection})
