const { sql } = require("slonik")

function insertNewTestRun(domain_id) {
  return sql`
    INSERT INTO test_runs (domain_id)
    VALUES (${domain_id})
    RETURNING id AS test_run_id
  `
}

function getTestRunByID(id) {
  return sql`
    SELECT
      dt.id,
      dt.domain_id,
      dt.created_at,
      dt.updated_at
    FROM test_runs dt
    WHERE dt.id = ${id}
    LIMIT 1
  `
}

function getTestResultByID(test_run_id) {
  return sql`
    SELECT
      res.test_name,
      res.test_output
    FROM test_results res
    WHERE
      res.test_run_id = ${test_run_id}
  `
}

module.exports = {
  insertNewTestRun,
  getTestRunByID,
  getTestResultByID,
}
