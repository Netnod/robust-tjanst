/*
 * Run this to populate your local database with example data
*/

if (process.env.NODE_ENV === 'production') throw new Error("Do not run seeds in production!")
require('dotenv').config()

const faker = require('faker')
const { sql } = require('slonik')
const db = require('./index')

const {hashPassword} = require('../utils')

const repeat = (times, cb) => {
  return Array.from({length: times}).map((_, i) => cb(i))
}

async function seed() {
  await db.query(sql`
    TRUNCATE TABLE accounts CASCADE;
    TRUNCATE TABLE domains CASCADE;
  `)

  const accountRows = await Promise.all(repeat(10, async (i) => 
    [`test${i}@example.com`, faker.name.findName(), await hashPassword('example')],
  ))

  const accounts = await db.many(sql`
    INSERT INTO accounts (email, name, password)
    SELECT *
    FROM ${sql.unnest(
      accountRows,
      [
        'varchar',
        'varchar',
        'varchar',
      ]
    )}
    RETURNING *
  `)

  console.log(accounts)

  const websites = []
  for (const account of accounts) {
    const rows = repeat(5, i =>
      sql.join([
        `https://${account.id}.${i}.example.com`,
        faker.date.between('2021-01-17', new Date()).toISOString()
      ], sql`, `),
    )

    const query = sql`
      INSERT INTO domains (domain_name, created_at)
      VALUES 
      (${sql.join(rows, sql`), (`)})
      RETURNING *
    `

    const account_websites = await db.many(query)
    websites.push(...account_websites)
  }

  console.log(websites)

  await db.end()
}

seed()
