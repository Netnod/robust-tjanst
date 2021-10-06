const tls = require('./tls')
const dns = require('./dns')

module.exports = (connection) => ({
  tls: tls(connection), 
  dns: dns(connection)
})