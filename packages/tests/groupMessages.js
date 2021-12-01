module.exports = {
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
  'dns': (tests) => {
    return {
      title: "DNS",
      description: "Rätt uppsatt DNS för ditt domännamn är viktigt för säkerhet och pålitlighet",
      result: 
        tests.every(t => t.passed) 
        ? "✔️ Allt ser bra ut!" 
        : "❌ Ett eller flera krav är inte uppnådda."
    }
  }
}
