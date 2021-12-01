module.exports = (result) => {
    const title = result.passed ? "Kan nås med HTTPS" : "Kunde inte nås med HTTPS"
    const description = result.passed 
      ? `Kunde nå tjänsten säkert på ${result.tested_url}. Bra jobbat!`
      : `Vi kunde inte nå tjänsten på ${result.tested_url}. Utan stöd för https kan användare inte vara säkra på att den information som visas är korrekt eller att den information de skickar till er är säker.`
    return {
      passed: result.passed,
      title,
      description
    }
  }
