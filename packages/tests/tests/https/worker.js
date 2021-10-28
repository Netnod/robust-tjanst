const { Worker } = require('bullmq')
const { startTest, deleteTest } = require('../../lib/kubernetes')
const queue = require('../../index').testQueues.https

const image = 'mullsork/https-reachable:latest'
const test_name = 'https-reachable'

module.exports = (connection, resultQueue) => new Worker(queue.name, async (job) => {
  console.log("HTTPS starting")
  await job.log(`Starting ${job.name}`)
  const {id, data: { url, test_id }} = job
  const podName = `${test_name}-${id}`
  try {
    const pod = await startTest(image, podName, id, [url])
    await pod.done()
    const logs = await pod.log()
    job.log(logs)

    const response = JSON.parse(logs)
    const output = { test_id, test_name, result: {passed: response.output === 'OK'} }
    await resultQueue.add(job.name, output);
  } catch (err) {
    await job.log(JSON.stringify(err))
    throw err;
  } finally {
    deleteTest(podName)
  }
}, {connection})
