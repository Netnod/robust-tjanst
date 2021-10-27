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
    let result = { test_id }
    if (response.result === 'ERROR') {
      result.passed = false
      result.title = "HTTPs-versionen kan inte nås"
      result.description = `Vi har en [bra guide](https://www.youtube.com/watch?v=dQw4w9WgXcQ) för sånt!`
    } else {
      result.passed = true
      result.title = "Hurra! HTTPs fungerar!"
      result.description = "Internet __är__ *bättre* då."
    }

    await resultQueue.add(job.name, result);
  } catch (err) {
    await job.log(JSON.stringify(err))
    throw err;
  } finally {
    deleteTest(podName)
  }
}, {connection})
