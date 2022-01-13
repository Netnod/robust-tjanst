module.exports = (result) => {
    const title = result.passed ? "DNS är ok" : "DNS är inte ok"
    // This is markdown, one line per warning/error
    const description = result.details
      .map(detail => `**${detail.level}** \`${detail.tag}\` ${detail.message}  \n`)
      .join("")

    return {
      passed: result.passed,
      title,
      description
    }
  }
