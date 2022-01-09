module.exports = (result) => {
    const title = result.passed ? "DNS är ok" : "DNS är inte ok"
    let description = "";
    // This is markdown, one line per warning/error
    for (const property in object.details) {
	description += '**' + `${object.details[property].level}` + '** ' +
	    '`' + `${object.details[property].tag}` + '` ' +
	    `${object.details[property].message}` +
	    '  \n';
    }
    return {
      passed: result.passed,
      title,
      description
    }
  }
