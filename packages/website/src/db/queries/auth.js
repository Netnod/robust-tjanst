const { sql } = require("slonik");

function findAccount(connection, email) {
  return connection.maybeOne(sql`
    SELECT id, email, password
    FROM accounts
    WHERE email = ${email}
    LIMIT 1
  `)
}


module.exports = { findAccount }