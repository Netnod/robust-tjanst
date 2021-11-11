const { Worker } = require('bullmq')
const { startTest, deleteTest } = require('../../lib/kubernetes')
const queue = require('../../index').testQueues.dns

module.exports = (connection, resultQueue) => new Worker(queue.name, async (job) => {
  const {id, data: { url, test_id }} = job
  const report = (status, result = {}) => resultQueue.add(job.name, {
    test_id,
    label: 'dns',
    status,
    result
  })

  await Promise.all([
    job.log('Starting DNS'),
    report('scheduled')
  ])

  try {
    const pod = await startTest('netnodse/robust-dns', `dns-${id}`, id, [url])
    await pod.done()
    const logs = await pod.log()
    job.log(logs)
    // TODO: parse log to json
    const result = {
      description: 'Things are **not** good, oh this is markdown [by the way](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
      passed: false
    }
    await report('finished', result)
  } catch (err) {
    await Promise.all([
      job.log(JSON.stringify(err)),
      report('error')
    ])
    throw err
  } finally {
    deleteTest(`dns-${id}`)
  }
}, {connection})
