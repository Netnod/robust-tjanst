const { sql } = require("slonik")

function insertNewTestRun(domain_id) {
  return sql`
    INSERT INTO test_runs (domain_id)
    VALUES (${domain_id})
    RETURNING 
      id AS test_run_id,
      public_id
  `
}

function getTestRunByPublicID(public_id) {
  return sql`
    SELECT
      dt.id,
      dt.domain_id,
      dt.created_at,
      dt.updated_at
    FROM test_runs dt
    WHERE dt.public_id = ${public_id}
    LIMIT 1
  `
}

function getTestResultByID(test_run_id) {
  return sql`
    SELECT
      res.test_name,
      res.test_output,
      res.execution_status
    FROM test_results res
    WHERE
      res.test_run_id = ${test_run_id}
  `
}

module.exports = {
  insertNewTestRun,
  getTestRunByPublicID,
  getTestResultByID,
}
