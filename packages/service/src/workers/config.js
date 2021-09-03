const IORedis = require('ioredis')

const TEST_QUEUE_NAME = 'TestQueue'

const connection = new IORedis(process.env.REDIS_URL)

module.exports = {
  TEST_QUEUE_NAME,
  connection
}