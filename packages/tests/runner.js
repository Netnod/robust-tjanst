const { Worker } = require('bullmq')
const {sql, createPool} = require('slonik')
const {tests, testRunQueue, resultQueue, testQueues, connection} = require('./index')

const pool = createPool(process.env.DATABASE_URL)

tests.forEach(test => {
  const worker = require('./testWorker')(test.name, test.image, test.concurrency, connection, resultQueue)

  worker.on('failed', (job, _failedReason) => {
    console.log("a test worker failed: ", {job_id: job.id}, job.data)
    pool.connect(c => 
      c.any(sql`
        UPDATE test_results 
        SET execution_status = 'aborted'
        WHERE id=${job.data.test_result_id}
      `)
    )
    // TODO: Report failedReason to sentry?
  })

  // "Finally, you should add an error listener to your worker"
  // https://docs.bullmq.io/guide/workers
  worker.on('error', err => {
    console.log('worker error', err)
    // FIXME: Sentry error reporting
  })
})

const testRunner = new Worker(testRunQueue.name, async ({data: {arguments, test_run_id}}) => {
  console.log("TestRunQueue", {arguments, test_run_id})

  // Insert a row for each test we are about to run
  const ids = await pool.connect(async c => {
    const values = tests.map(t => [test_run_id, t.name, 'pending'])

    const rows = await c.any(sql`
      INSERT INTO test_results (test_run_id, test_name, execution_status)
      SELECT * 
      FROM ${sql.unnest(values, ['int8', 'text', 'execution_states'])}
      RETURNING id, test_name
    `)
    const lookup = rows.reduce(
      (acc, next) => ({...acc, [next.test_name]: next.id}),
      {}
    )

    return lookup
  })

  // Schedule each test and send its result_id (primary key on test_results) along
  await Promise.all(
    testQueues.map(tq => tq.add(`${arguments.host}`, {arguments, test_run_id, test_result_id: ids[tq.name]}))
  )
}, {connection})

testRunner.on('failed', (job, failedReason) => {
  console.log('testRunner failed!', {job_id: job.id}, failedReason)
})

testRunner.on('error', err => {
  console.log('testRunner error!', err)
  // FIXME: Sentry error reporting
})

const resultWorker = new Worker(resultQueue.name, async ({data}) => {
  console.log("ResultQueue", data)
  const { test_result_id, test_output } = data

  await pool.connect(async (connection) => {
    await connection.any(sql`
      UPDATE test_results 
      SET execution_status = 'completed',
          test_output = ${JSON.stringify(test_output)}
      WHERE test_results.id = ${test_result_id} 
    `)
  })
}, {connection})

resultWorker.on('failed', (job, failedReason) => {
  console.log('resultWorker failed!', {job_id: job.id}, failedReason)
})

resultWorker.on('error', err => {
  console.log('resultWorker error!', err)
  // FIXME: Sentry error reporting
})
