const IORedis = require('ioredis')
const redis = new IORedis(process.env.REDIS_URL)

// const testQueue = new Queue('run_tests', {connection: new IORedis(process.env.REDIS_URL)})

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function createTestRun(dbPool, domainId, arguments) {
  const id = await dbPool.connect(async (connection) => {
    const {domain_id} = await connection.one(upsertDomain(parsedUrl.host))
    const {test_run_id, public_id} = await connection.one(insertNewTestRun(domain_id))
    // await testQueue.add('Test run request', {test_run_id, domain_id, arguments: parsedUrl})

    return public_id 
  })
}

async function insertTest(dbPool, domainId) {
  const reply = await redis.set(`test-lock:${domainId}`, "wait", "EX", 10, "NX")
  console.log({reply})
  if (reply == null) {
    // SET "failed", there is a lock already
    // Let's find that test and return it
    function getTestId() { return redis.get(`test-lock:${domainId}`) }

    for (let times = 0; times < 5; times++) {
      const test = await getTestId()
      if (test === "wait") {
        // Whoever created the lock has not yet provided a test id
        await sleep(500)
        continue
      }
      
      console.log("Found the test from lock: ", test, test === "true")
      return test
    }
  }

  console.log("Should schedule a test")
  // const id = (new Date()) - 0
  // await redis.set(`test-lock:${domainId}`, id, "EX", 10)
}

insertTest(null, 1).then(() => redis.disconnect())