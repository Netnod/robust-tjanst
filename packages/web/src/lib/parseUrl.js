function parseUrl(url) {
  const urlWithProto = /^.+(?::\/\/).+$/.test(url) ? url : `http://${url}`
  const parsed = new URL(urlWithProto) // Will throw if unable to parse

  if (parsed.host === '' || parsed.hostname === '') {
    throw new Error(`Could not parse url ${urlWithProto}`)
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`Unsupported protocol ${parsed.protocol}`)
  }

  // TODO: somehow make sure we don't allow localhost, 127.0.0.1 etc
  // TODO: block certain ports?
  return {
    host: parsed.host, // 'example.com:8080'
    pathname: parsed.pathname, // '/pages/foobar'
    hostname: parsed.hostname, // 'example.com'
    protocol: parsed.protocol // 'http:' mind the colon
  }
}

module.exports = parseUrl