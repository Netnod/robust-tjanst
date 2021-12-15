module.exports = {
  https: (tests) => {
    return {
      title: 'HTTPS',
      description: 'Säker åtkomst till tjänsten krypterad anslutning',
      result: {
        success: tests.every((t) => t.passed),
        description: tests.every((t) => t.passed)
          ? '✔️ Kommunikationen är skyddad'
          : '❌ All kommunikation är inte skyddad',
      },
    };
  },
  dns: (tests) => {
    return {
      title: 'DNS',
      description:
        'Rätt uppsatt DNS för ditt domännamn är viktigt för säkerhet och pålitlighet',
      result: {
        success: tests.every((t) => t.passed),
        description: tests.every((t) => t.passed)
          ? '✔️ Allt ser bra ut!'
          : '❌ Ett eller flera krav är inte uppnådda.',
      },
    };
  },
};
