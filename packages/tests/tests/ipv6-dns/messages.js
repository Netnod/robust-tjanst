module.exports = (result) => {
    const title = result.passed ? "Sidan har IPv6-adress" : "Sidan saknar IPv6-adress"
    const description = result.passed 
	  ? `IPv6-adress(er) för ${result.details.domain} hittades ${result.details.ipv6}. Därmed kan access göras över IPv6 till sidan.`
	  : `Ingen IPv6-adress hittades för ${result.details.domain}, dvs det saknades en DNS-post av typ AAAA. Därmed kan ingen kontakt göras med sidan över IPv6. Felet är ${result.details.ipv6}.`
    return {
      passed: result.passed,
      title,
      description
    }
  }
