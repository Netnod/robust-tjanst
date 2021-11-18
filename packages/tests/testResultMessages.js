
const GROUPINGS = {
  'https-reachable': 'https',
  'https-redirect': 'https',
  'dnssec-presence': 'dnssec'
}

// TODO: break up RESULTORS and move the them to be with the test they belong to
// this file should get them all from the tests and return them together
const RESULTORS = {
  'https-reachable': (domain, result) => {
    const title = result.passed ? "Kan nås med HTTPS" : "Kunde inte nås med HTTPS"
    // TODO: get the tested URL as output from the test instead
    const description = result.passed 
      ? `Kunde nå tjänsten säkert på ${result.tested_url}. Bra jobbat!`
      : `Vi kunde inte nå tjänsten på ${result.tested_url}. Utan stöd för https kan användare inte vara säkra på att den information som visas är korrekt eller att den information de skickar till er är säker.`
    return {
      passed: result.passed,
      title,
      description
    }
  },
  'https-redirect': (domain, result) => {
    const title = "Automatisk vidarebefordran till HTTPS-versionen"
    // TODO: get the tested URL as output from the test instead
    const description = result.passed
      ? `http://${domain.domain_name} skickade oss automatiskt till https://${domain.domain_name} `
      : `http://${domain.domain_name} borde automatiskt skicka alla besökare till https://${domain.domain_name}, inte erbjuda en osäker version av sidan.`
    return {
      passed: result.passed,
      title,
      description
    }
  },
  'dnssec-presence': (domain, result) => {
    // TODO: implement
    return {
      passed: result.passed,
      title: "DNSSec existans",
      description: "**Tillvägagångssätt:** Vi letar efter domänets SOA record och kollar om det är signerat med DNSSEC",
    }
  }
}

const GROUP_DESCRIPTIONS = {
  'https': (domain, tests) => {
    return {
      title: "HTTPS",
      description: "Säker åtkomst till tjänsten krypterad anslutning",
      result: 
        tests.every(t => t.passed)
        ? "✔️ Kommunikationen är skyddad"
        : "❌ All kommunikation är inte skyddad",
    }
  },
  'dnssec': (domain, tests) => {
    return {
      title: "DNSSEC",
      description: `
        Moderna webbläsare och verktyg vet hur man validerar svar från DNS-servern genom kryptografiska signaturer. 
        Därmed kan webbläsaren vara säker på att svaret inte manipulerats utan kommer från den korrekta källan.
      `,
      result: tests.every(t => t.passed) ? "Allt ser bra ut!" : "En eller flera krav är inte uppnådda."
    }
  }
}

module.exports = {
  RESULTORS,
  GROUPINGS,
  GROUP_DESCRIPTIONS,
}
