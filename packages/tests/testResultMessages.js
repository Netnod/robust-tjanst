

// TODO: break up RESULTORS and move the them to be with the test they belong to
// this file should get them all from the tests and return them together
const RESULTORS = {
  'https-reachable': (result) => {
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
  'https-redirect': (result) => {
    const title = "Automatisk vidarebefordran till HTTPS-versionen"
    // TODO: get the tested URL as output from the test instead
    const description = result.passed
      ? `http://${result.tested_domain} skickade oss automatiskt till https://${result.tested_domain} `
      : `http://${result.tested_domain} borde automatiskt skicka alla besökare till https://${result.tested_domain}, inte erbjuda en osäker version av sidan.`
    return {
      passed: result.passed,
      title,
      description
    }
  },
  'dnssec-presence': (result) => {
    // TODO: implement
    return {
      passed: result.passed,
      title: "DNSSec existans",
      description: "**Tillvägagångssätt:** Vi letar efter domänets SOA record och kollar om det är signerat med DNSSEC",
    }
  }
}

const GROUP_DESCRIPTIONS = {
  'https': (tests) => {
    return {
      title: "HTTPS",
      description: "Säker åtkomst till tjänsten krypterad anslutning",
      result: 
        tests.every(t => t.passed)
        ? "✔️ Kommunikationen är skyddad"
        : "❌ All kommunikation är inte skyddad",
    }
  },
  'dnssec': (tests) => {
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
  GROUP_DESCRIPTIONS,
}
