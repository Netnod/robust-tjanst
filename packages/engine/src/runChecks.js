const shell = require('shelljs')

shell.config.silent = true

function dig(str) {
  return new Promise((resolve, reject) => {
    shell.exec(`dig +time=1 ${str}`, {async: true}, function(code, stdout, stderr) {
      if (code === 0) resolve(stdout)
      else reject(stderr || stdout)
    })
  })
}


async function testIPv4(domain) {
  try {
    await dig(`-4 ${domain}`)
    return true
  } catch {
    return false
  }
}

async function testIPv6(domain) {
  try {
    await dig(`-6 ${domain}`)
    return true
  } catch {
    return false
  }
}

async function execute(domain) {
  const [ipv4_dig, ipv6_dig] = await Promise.all([testIPv4(domain), testIPv6(domain)])

  return {
    ipv4_dig,
    ipv6_dig,
  }
}

const cache = new Map()

module.exports = async function check(domain) {
  if (cache.has(domain)) return cache.get(domain)
  const result = await execute(domain)
  cache.set(domain, result)
  return result
}
