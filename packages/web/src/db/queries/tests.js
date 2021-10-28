const { sql } = require("slonik")

function getTestByID(id) {
  return sql`
    SELECT
      dt.id,
      dt.domain_id,
      dt.created_at,
      dt.updated_at
    FROM tests dt
    WHERE dt.id = ${id}
    LIMIT 1
  `
}

function getTestPartsAndGroupsByTestID(test_id) {
  return sql`
    SELECT
      res.test_name,
      res.test_result
    FROM test_results res
    WHERE
      res.test_id = ${test_id}
  `
}

module.exports = {
  getTestByID,
  getTestPartsAndGroupsByTestID
}
