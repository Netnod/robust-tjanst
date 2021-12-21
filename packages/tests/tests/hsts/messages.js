module.exports = (result) => {
    const title = result.passed ? "Har HSTS, bra!" : "Sidan saknar HSTS"
    const description = result.passed 
      ? `${result.details.tested_url} svarade med en HSTS header vilket garanterar att kontakten med sidan kommer göras över en säkert anslutning.`
    : `${result.details.tested_url} svarade inte med en HSTS header. Detta innebär att en användare som skriver ${result.details.host} utan https:// innan i sin webbläsare är sårbar för en [Man-in-the-Middle-Attack](https://en.wikipedia.org/wiki/Man-in-the-middle_attack).`
    return {
      passed: result.passed,
      title,
      description
    }
  }
