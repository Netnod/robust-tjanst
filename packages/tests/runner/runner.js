const {workers, connection} = require('../index')

Object.values(workers).forEach(w => w(connection))
// workers(connection) // start workers