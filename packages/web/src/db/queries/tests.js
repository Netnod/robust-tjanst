const { sql } = require("slonik")

function getTestByID(id) {
  return sql`
    SELECT
      dt.id,
      dt.domain_id,
      dt.created_at,
      dt.updated_at,
      dt.test_status,
      dt.final_score
    FROM domain_tests dt
    WHERE dt.id = ${id}
    LIMIT 1
  `
}

function getTestPartsByTestID(test_id) {
  return sql`
    SELECT 
      dtp.part_id,
      dtp.created_at,
      dtp.updated_at,
      dtp.test_status
    FROM
      domain_test_part dtp
    WHERE
      dtp.domain_test_id = ${test_id}
  `
}

module.exports = {
  getTestByID,
  getTestPartsByTestID
}
