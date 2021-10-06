const { Worker } = require('bullmq')
const { startTest } = require('../lib/kubernetes')

module.exports = (connection) => new Worker('tls', async ({log, id, data: { url, environment }}) => {
  // schedule api call to kubernetes with label id and parameter url
  const pod = await startTest('netnod/check-tls', `tls-${id}`, id, environment)
  console.log('pod scheduled')
  
  return new Promise((resolve, reject) => pod.status.then(({response}) => {
    const status = response.body?.status.phase
    console.log('status', status)
    if (status === 'Succeeded') return resolve()
    if (status === 'Failed') return reject()

    response.on('data', msg => {
        console.log('status:' + msg)
        log('status: ' + msg)
        if (msg === 'Done') resolve()
      })
    })
  )
}, {connection})