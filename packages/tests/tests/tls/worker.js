const { Worker } = require('bullmq')
const { startTest, deleteTest } = require('../../lib/kubernetes')
const queue = require('../../index').testQueues.tls

module.exports = (connection, resultQueue) => new Worker(queue.name, async (job) => {
  console.log('starting dns', job.name)
  await job.log("Starting tls")
  const {id, data: { url }} = job
  try {
    const pod = await startTest('netnodse/robust-tls', `tls-${id}`, id, [url])
    await pod.done()
    const logs = await pod.log()
    job.log(logs)
    // TODO: parse log to json
    const results = {
      test_id,
      test_label: 'TLS Check'
    }
    await resultQueue.add(job.name, results);
  } catch (err) {
    await job.log(JSON.stringify(err))
    throw err;
  } finally {
    deleteTest(`tls-${id}`)
  }
}, {connection})