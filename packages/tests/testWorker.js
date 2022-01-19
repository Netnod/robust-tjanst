const { Worker } = require('bullmq')
const { startTest, deleteTest } = require('./lib/kubernetes')

const {KubernetesError, TestError} = require('./errors')

async function runTest(image, podName, id, containerArguments) {
  const pod = await startTest(image, podName, id, containerArguments)
  await pod.done()
  return pod.log()
}

function extractResult(logs) {
  let response
  try {
    response = JSON.parse(logs)
  } catch (err) {
    throw new TestError(`Malformed JSON in output! ${JSON.stringify(err)}`)
  }

  if (typeof response.passed !== 'boolean' || typeof response.details !== 'object') {
    throw new TestError(`Invalid test pod response of type`)
  }

  const {passed, details} = response
  return {passed, details}
}

module.exports = (test_name, image, connection, resultQueue) => new Worker(test_name, async (job) => {
  console.log(`Starting ${test_name}`)
  await job.log(`Starting ${job.name}`)
  const {id, data: { arguments, test_run_id }} = job
  const podName = `${test_name}-${test_run_id}`
  const containerArguments = [
      arguments.host,
      arguments.pathname,
      arguments.hostname,
      arguments.protocol
  ]

  try {
    console.log(`running ${image} ${JSON.stringify(containerArguments)}`)
    const logs = await runTest(image, podName, id, containerArguments)
    await job.log(`Pod logs: ${logs}`)

    const test_output = extractResult(logs)
    const output = { test_run_id, test_name, test_output }

    await resultQueue.add(job.name, output);
  } catch (err) {
    if (err instanceof KubernetesError) {
      console.log(err)
      await job.log(`K8S error: ${err.message} ${JSON.stringify(err.apiResponse)}`)
    } else if (err instanceof TestError) {
      await job.log(`TestError: ${err}`)
    } else {
      await job.log(`WorkerError: ${err}`)
    }

    console.log(`Error: ${err}`)
    throw err;
  } finally {
    await deleteTest(podName)
  }
}, {connection})
