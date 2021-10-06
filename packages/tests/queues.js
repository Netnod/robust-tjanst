const { Queue } = require('bullmq')

module.exports = (connection) => ({
  dns: new Queue('dns', {connection}),
  tls: new Queue('tls', {connection}),
})