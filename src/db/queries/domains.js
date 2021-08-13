const { sql } = require("slonik");

function getTopDomains() {
  return sql`
    SELECT 
      d.id, 
      d.domain_name,
      lt.created_at AS last_tested_at,
      lt.final_score
    FROM domains d
    INNER JOIN domain_tests lt ON lt.domain_id = d.id
    WHERE lt.id = (
      SELECT id
      FROM domain_tests dt
      WHERE dt.domain_id = lt.domain_id
      ORDER BY created_at DESC
      LIMIT 1
    )
    LIMIT 25
  `
}

function getLatestResult(conn, domain_name) {
  return conn.maybeOne(sql`
    SELECT
      test.id,
      test.updated_at,
      test.final_score 
    FROM domain_tests test
    INNER JOIN
      domains d ON (d.domain_name = ${domain_name})
    WHERE
      -- TODO: ENUM changes this
      test.test_status = 'FIN'
    ORDER BY
      test.updated_at DESC
    LIMIT 1
  `)
}


module.exports = {
  getTopDomains,
  getLatestResult
}