const { Worker } = require('bullmq')
const { startTest, deleteTest } = require('../../lib/kubernetes')
const queue = require('../../index').testQueues.dns

module.exports = (connection) => new Worker(queue.name, async (job) => {
  await job.log('Starting DNS')
  const {id, data: { url }} = job
  try {
    const pod = await startTest('netnodse/robust-dns', `dns-${id}`, id, [url])
    await pod.done()
    const logs = await pod.log()
    job.log(logs)
    // TODO: parse log to json
    return logs
  } catch (err) {
    await job.log(JSON.stringify(err))
    throw err
  } finally {
    deleteTest(`dns-${id}`)
  }
}, {connection})
