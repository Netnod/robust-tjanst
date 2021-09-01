throw new Error("Not here!")
const {Engine} = require('engine')

const { TEST_QUEUE_NAME } = require('./config')
const {scheduleTestRun} = require('./schedule')
const dbPool = require('../db')

const {Worker} = require('bullmq')
const {sql} = require('slonik')

function waitForEvent(emitter, event) {
  return new Promise((resolve, reject) => {
    const success = (val) => {
      emitter.off("error", fail);
      resolve(val);
    };
    const fail = (err) => {
      emitter.off(event, success);
      reject(err);
    };
    emitter.once(event, success);
    emitter.once("error", fail);
  });
}

// TODO: This job needs to know the ID of the test it is to run
//       Whoever schedules a test first creates a test in the DB and passes this ID around
// 
const worker = new Worker(TEST_QUEUE_NAME, async (job) => {
  const {test_id} = job.data
  const engine = new Engine(job.data.domain_id)
  console.log(`job:${job.name}`, job.data)

  await dbPool.connect(async (db) => {
    // Keeps track of all statements (promises) sent to the DB so that we can make sure they're
    // all finished before we return from this function, which closes our DB connection
    const statements = []

    // TODO: This swallows errors if connection fails?
    await db.query(sql`DELETE FROM domain_test_part WHERE domain_test_id=${test_id}`)

    async function writeTestUpdateToDB({name, id, status}) {
      console.log('test:update', id, status)
      statements.push(db.query(sql`
         UPDATE domain_test_part
         SET test_status=${status}
         WHERE domain_test_id=${test_id}
         AND part_id=${id}
      `))
    }
    
    async function writePlanToDB(plan) {
      console.log('plan')
      const columns = plan.map(({id, name, status}) => sql.join([test_id, id, status], sql`, `))
      statements.push(db.query(sql`
        INSERT INTO domain_test_part 
        (domain_test_id, part_id, test_status)
        VALUES 
          (${sql.join(columns, sql`), (`)})
      `))
    }

    engine.once('plan', writePlanToDB)
    engine.on('test:update', writeTestUpdateToDB)
    engine.run()

    return new Promise(async (resolve, reject) => {
      // TODO: Do we need a timeout or error handling?
      await waitForEvent(engine, 'results')
      // TODO: Write to domain_tests
      return Promise.all(statements).then(resolve, reject)
    })
  })
}, {connection: process.env.REDIS_URL})


worker.on('completed', (job, value) => {
  console.log('completed', job.id, job.name, job.data, value)
})


// scheduleTestRun(60)