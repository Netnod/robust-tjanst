// Usage: `node assert.js testName`
const { startTest, deleteTest } = require('./lib/kubernetes')
const { parseUrl } = require('common/url')
const { tests } = require('./index')

const worker = async (test_name, image, arguments, log, addResult) => {
  const id = `assertion-${test_name}`
  const podName = `assertion-${test_name}`
  await log(`arguments: ${Object.values(arguments)}`)
  try {
    const pod = await startTest(image, podName, id, Object.values(arguments))

    await log(`waiting for pod to be ready`)
    await log(`pod is ready`)
    await pod.done()
    const logs = await pod.log()

    await log(`pod logs: ${logs}`)

    const response = JSON.parse(logs)
    if (typeof response.passed !== 'boolean' || typeof response.details !== 'object') {
      throw new Error('Invalid test pod response output!')
    }
    const output = { test_name, test_output: { ...response } }
    await addResult(output);
  } catch (err) {
    // TODO: log only relevant parts of err, k8s errors are very verbose
    console.log(err)
    await log('Test pod failed with: ' + JSON.stringify(err))
    throw err;
  } finally {
    deleteTest(podName)
  }
}

async function start(test_name, argument) {
  const test = tests.find(t => t.name === test_name)
  if (!test) throw new Error(`No test with name ${test_name} found`)
  console.log(`Running assertions for test ${test_name}`)

  function log(message) {
    console.log(`job.log: ${message}`)
    return Promise.resolve()
  }

  function addResult(result) {
    console.log(`job.result: ${JSON.stringify(result)}`)
    return Promise.resolve()
  }
  try {
    await worker(test.name, test.image, parseUrl(argument), log, addResult)
  } catch (_) {
    // workers report their errors through logs but also rethrow errors so that
    // bullmq will know
  }
}

setTimeout(
  // timeout because of https://trello.com/c/k2yewbEy/56-we-should-await-result-from-is-docker
  () => start("https-existance", "netnod.se"), 
  1500
)