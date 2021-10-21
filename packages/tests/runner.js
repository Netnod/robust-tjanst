const { Worker } = require('bullmq')
const {sql, createPool} = require('slonik')
const {testQueue, resultQueue, testQueues, connection} = require('./index')
const { startTest, deleteTest } = require('./lib/kubernetes')

const https = require('./tests/https')
const pool = createPool(process.env.DATABASE_URL)

const TESTS = [
  {
    group_key: 'https',
    run: https,
    queue: testQueues.https
  }
]

const workers = TESTS.map(test => 
  new Worker(test.queue.name, async (job) => {
    const cleanup = []
    let docker_i = 0;
    const report = (payload) => resultQueue.add(job.name, {...payload, test_id: job.data.test_id})

    const runDockerImage = async (image, args) => {
      const name = `${test.queue.name}-${job.id}-${docker_i}`
      cleanup.push(() => deleteTest(name))

      args = Array.isArray(args) ? args : [args]
      await job.log(`starting k8s pod "${name}" with image "${image}"`)
      const pod = await startTest(image, name, job.id, args)

      await pod.done()
      await job.log(`k8s pod is ready`)
      return pod.log()
    }

    const createGroup = async (group_key) => {
      await report({type: 'group', key: group_key, status: 'scheduled'})
      cleanup.push(async () => report({type: 'group', key: group_key, status: 'finished'}))

      return {
        update: async ({status}) => {
          await report({type: 'group', key: group_key, status})
        },
        createTest: async (test_key) => {
          await report({type: 'test', key: test_key, group_key, status: 'scheduled'})
          return {
            update: (payload) => report({...payload, type: 'test', key: test_key, group_key})
          }
        }
      }
    }

    try {
      await test.run({
        docker: runDockerImage, 
        createGroup,
        data: job.data,
      })
    } catch (err) {
      await job.log("error: ")
      await job.log(JSON.stringify(err))
      throw err;
    } finally {
      for (const cb of cleanup) {
        await cb()
      }
      console.log("done")
    }
  })  
, {connection})

new Worker(testQueue.name, async ({data: {url, test_id}}) => {
  await Promise.all([
    testQueues.https.add(`HTTPS: ${url}`, {url, test_id})
  ])
}, {connection})

new Worker(resultQueue.name, async ({data}) => {
  const {type, key, test_id} = data
  console.log("ResultQueue", data)

  await pool.connect(async (connection) => {
    if (type === "group") {
      const {status, title, description} = data
      await connection.any(sql`
        INSERT INTO test_groups (test_id, group_key, run_status, result_title, result_description)
        VALUES (${test_id}, ${key}, ${status}, ${title || ''}, ${description || ''})
        ON CONFLICT ON CONSTRAINT test_groups_test_id_group_key_key
        DO UPDATE
          SET 
            run_status=EXCLUDED.run_status,
            result_title=EXCLUDED.result_title,
            result_description=EXCLUDED.result_description
      `)
    } else if (type === "test") {
      const {status, group_key, passed, title, description} = data
      await connection.any(sql`
        INSERT INTO test_group_parts (group_id, part_key, run_status, run_passed, run_title, run_description)
        VALUES (
          (SELECT id FROM test_groups WHERE test_id = ${test_id} AND group_key=${group_key} LIMIT 1),
          ${key}, ${status}, ${passed || false}, ${title || ''}, ${description || ''}
        )
        ON CONFLICT ON CONSTRAINT test_group_parts_group_id_part_key_key 
        DO UPDATE
          SET 
            run_status=EXCLUDED.run_status,
            run_title=EXCLUDED.run_title,
            run_description=EXCLUDED.run_description
      `)
    } else {
      throw `Unknown type ${type}`
    }
  })
})
//   const {test_id, label, status, result} = data

//   await pool.connect(async (connection) => {
//     await connection.any(sql`
//       INSERT INTO domain_test_parts (domain_test_id, part_id, test_status, result_pass, result_description)
//       VALUES (${test_id}, ${label}, ${status}, ${result.passed || false}, ${result.description || ''})
//       ON CONFLICT ON CONSTRAINT domain_test_parts_domain_test_id_part_id_key
//       DO UPDATE
//         SET 
//           test_status=EXCLUDED.test_status,
//           result_pass=EXCLUDED.result_pass,
//           result_description=EXCLUDED.result_description
          
//     `)
//   })
// })


// setTimeout(
//   () => {
//     testQueue.add("test", {test_id: 1, url: "http://iteam.se"})
//   }, 500
// )