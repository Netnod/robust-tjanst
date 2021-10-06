const { Worker } = require('bullmq')
const { startTest, deleteTest } = require('../lib/kubernetes')

module.exports = (connection) => new Worker('dns', async (job) => {
  const {id, data: { url }} = job
  try {
    const pod = await startTest('iteam1337/test-dns', `dns-${id}`, id, { url })
    await pod.done()
    const logs = await pod.log()
    job.log(logs)
    // TODO: parse log to json
    return logs
  } finally {
    deleteTest(`dns-${id}`)
  }
}, {connection})
