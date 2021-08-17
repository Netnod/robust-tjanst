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

function getDomainsForAccount(account_id) {
  return sql`
    SELECT
      d.id,
      d.domain_name,
      d.created_at 
    FROM account_domains ad
    INNER JOIN domains d ON (d.id = ad.domain_id)
    WHERE ad.account_id = ${account_id}
  `
}

function getDomainForAccountByURL(account_id, url) {
  return sql`
    SELECT
      d.id,
      d.domain_name,
      d.created_at
    FROM account_domains ad
    INNER JOIN domains d ON (d.id = ad.domain_id)
    WHERE ad.account_id = ${account_id}
    AND d.domain_name = ${url}
  `
}

function getDomainForAccountByID(account_id, domain_id) {
  return sql`
    SELECT
      d.id,
      d.domain_name,
      d.created_at
    FROM account_domains ad
    INNER JOIN domains d ON (d.id = ad.domain_id)
    WHERE 
      d.id = ${domain_id}
    AND
      ad.account_id = ${account_id}
  `
}

function insertDomain(url) {
  return sql`
    INSERT INTO domains (domain_name)
    VALUES 
      (${sql.join([url], sql`, `)})
    RETURNING id
  `
}

function associateAccountWithDomain(account_id, domain_id) {
  return sql`
    INSERT INTO account_domains (account_id, domain_id)
    VALUES 
      (${sql.join([account_id, domain_id], sql`, `)})
  `
}

function getTestHistoryForDomain(domain_id) {
  return sql`
    SELECT
      dt.id,
      dt.created_at,
      dt.test_status,
      dt.final_score
    FROM domain_tests dt
    WHERE dt.id = ${domain_id}
  `
}

module.exports = {
  getTopDomains,
  getLatestResult,
  getDomainsForAccount,
  getDomainForAccountByURL,
  getDomainForAccountByID,
  insertDomain,
  associateAccountWithDomain,
  getTestHistoryForDomain,
}