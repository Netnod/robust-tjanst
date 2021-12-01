module.exports = (result) => {
  return {
    passed: result.passed,
    title: "DNSSec existans",
    description: "**Tillvägagångssätt:** Vi letar efter domänets SOA record och kollar om det är signerat med DNSSEC",
  }
}
