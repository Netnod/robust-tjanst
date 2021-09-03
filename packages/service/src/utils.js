const { genSalt, hash } = require('bcrypt');

async function hashPassword(free_text) {
  const salt = await genSalt(10)
  return await hash(free_text, salt)
}

module.exports = {
  hashPassword
}