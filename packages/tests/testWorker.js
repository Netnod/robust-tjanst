const { Worker } = require('bullmq')
const { startTest, deleteTest } = require('./lib/kubernetes')

module.exports = (test_name, image, connection, resultQueue) => new Worker(test_name, async (job) => {
  console.log(`Starting ${test_name}`)
  await job.log(`Starting ${job.name}`)
  const {id, data: { arguments, test_run_id }} = job
  const podName = `${test_name}-${test_run_id}`
  try {
    console.log(`running ${image} ${Object.values(arguments)}`)
    const pod = await startTest(image, podName, id, Object.values(arguments))
    await pod.done()
    const logs = await pod.log()
    job.log('Test returned: ' + logs)

    const response = JSON.parse(logs)
    if (typeof response.passed !== 'boolean' || typeof response.details !== 'object') {
      throw new Error('Invalid test pod response output!')
    }
    const output = { test_run_id, test_name, test_output: { ...response } }
    console.log(response)
    await resultQueue.add(job.name, output);
  } catch (err) {
    // TODO: log only relevant parts of err, k8s errors are very verbose
    await job.log('Test pod failed with: ' + JSON.stringify(err))
    throw err;
  } finally {
    deleteTest(podName)
  }
}, {connection})