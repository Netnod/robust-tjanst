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
      g.group_key,
      g.run_status AS group_status,
      g.result_pass AS group_is_passed,
      test.part_key AS test_key,
      test.run_status AS test_status,
      test.run_passed AS test_is_passed,
      test.run_title AS test_title,
      test.run_description AS test_description
    FROM test_groups g
    INNER JOIN test_group_parts test ON (g.id = test.group_id)
    WHERE
      g.test_id = ${test_id}
  `
}

module.exports = {
  getTestByID,
  getTestPartsAndGroupsByTestID
}
