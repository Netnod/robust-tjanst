const { Worker } = require('bullmq')
const {sql, createPool} = require('slonik')
const {testRunQueue, resultQueue, testQueues, connection} = require('./index')
const { startTest, deleteTest } = require('./lib/kubernetes')

const https = require('./tests/https')
const pool = createPool(process.env.DATABASE_URL)

new Worker(testRunQueue.name, async ({data: {url, test_id}}) => {
  await Promise.all([
    testQueues.https.add(`HTTPS-REACHABLE: ${url}`, {url, test_id})
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
        INSERT INTO test_results (run_status, run_passed, run_title, run_description)
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
