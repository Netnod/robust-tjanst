module.exports = (result) => {
    const title = result.passed ? "Går att nå med IPv6!" : "Sidan går ej att nås med IPv6"
    const description = result.passed 
      ? `${result.details.tested_url} gick att nå med protokollet IPv6 vilket innebär en snabbare och effektivare access för de slutanvändare som själva har IPv6.`
    : `${result.details.tested_url} gick inte att nå med protokollet IPv6. Detta innebär att en användare som försöker nå ${result.details.host} som bara har IPv6 inte kan nå den. De som har både IPv4 och IPv6 måste använda IPv4 och kan inte använda den av IPv4 och IPv6 som fungerar bäst.`
    return {
      passed: result.passed,
      title,
      description
    }
  }
