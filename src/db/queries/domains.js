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


module.exports = {
  getTopDomains
}