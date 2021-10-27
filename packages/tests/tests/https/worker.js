const { Worker } = require('bullmq')
const { startTest, deleteTest } = require('../../lib/kubernetes')
const queue = require('../../index').testQueues.https

const image = 'mullsork/https-reachable:latest'
const testName = 'https-reachable'

module.exports = (connection, resultQueue) => new Worker(queue.name, async (job) => {
  await job.log(`Starting ${job.name}`)
  const {id, data: { url, test_id }} = job
  const podName = `${testName}-${id}`
  try {
    const pod = await startTest(image, podName, id, [url])
    await pod.done()
    const logs = await pod.log()
    job.log(logs)

    const response = JSON.parse(raw_response)
    let output = { test_id, testName }
    if (response.output === 'ERROR') {
      output.result = { passed: false }
    } else { // TODO: maybe not fail open? :)
      output.result = { passed: true }
    }

    await outputQueue.add(job.name, output);
  } catch (err) {
    await job.log(JSON.stringify(err))
    throw err;
  } finally {
    deleteTest(podName)
  }
}, {connection})
