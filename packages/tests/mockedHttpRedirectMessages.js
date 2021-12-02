module.exports = (result) => {
  const title = "Automatisk vidarebefordran till HTTPS-versionen"
  const description = result.passed
    ? `http://${result.details.tested_domain} skickade oss automatiskt till https://${result.details.tested_domain} `
    : `http://${result.details.tested_domain} borde automatiskt skicka alla besökare till https://${result.details.tested_domain}, inte erbjuda en osäker version av sidan.`
  return {
    passed: result.passed,
    title,
    description
  }
}
