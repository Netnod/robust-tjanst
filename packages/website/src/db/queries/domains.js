const { sql } = require("slonik");

function getDomainByID(id) {
  return sql`
    SELECT
      d.id,
      d.domain_name,
      d.created_at 
    FROM domains d 
    WHERE d.id = ${id}
  `
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

function upsertDomain(domain) {
  return sql`
    INSERT INTO domains (domain_name)
    VALUES (${domain})
    ON CONFLICT ON CONSTRAINT domains_domain_name_key
    DO UPDATE SET domain_name=domains.domain_name
    -- This ensures we have an id to return ^
    RETURNING id AS domain_id
  `
}

function associateAccountWithDomain(account_id, domain_id) {
  return sql`
    INSERT INTO account_domains (account_id, domain_id)
    VALUES
      (${sql.join([account_id, domain_id], sql`, `)})
  `
}

module.exports = {
  getDomainsForAccount,
  getDomainByID,
  getDomainForAccountByURL,
  getDomainForAccountByID,
  insertDomain,
  upsertDomain,
  associateAccountWithDomain,
}
