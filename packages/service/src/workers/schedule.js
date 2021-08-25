const {Queue} = require('bullmq')
const { TEST_QUEUE_NAME } = require('./config')

const TestQueue = new Queue(TEST_QUEUE_NAME)

async function scheduleTestRun(test_id) {
  await TestQueue.add('test_url', {test_id})
}

module.exports = {
  scheduleTestRun
}