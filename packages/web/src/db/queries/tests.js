const { sql } = require("slonik")

function getTestByID(id) {
  return sql`
    SELECT
      dt.id,
      dt.domain_id,
      dt.created_at,
      dt.updated_at
    FROM domain_tests dt
    WHERE dt.id = ${id}
    LIMIT 1
  `
}

function getTestPartsByTestID(test_id) {
  return sql`
    SELECT 
      dtp.part_id AS test_id,
      dtp.result_description AS description,
      dtp.test_status AS status
    FROM
      domain_test_parts dtp
    WHERE
      dtp.domain_test_id = ${test_id}
  `
}

module.exports = {
  getTestByID,
  getTestPartsByTestID
}
