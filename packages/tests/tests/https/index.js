module.exports = async ({createGroup, docker, data: {url}}) => {
  const group = await createGroup('https')
  const test = await group.createTest('reachable')
  const raw_response = await docker('mullsork/https-reachable:latest', url)
  const response = JSON.parse(raw_response)

  const payload = {
    status: 'finished',
    passed: false,
    description: '',
    title: ''
  }

  if (response.result === 'ERROR') {
    payload.passed = false
    payload.title = "HTTPs-versionen kan inte nås"
    payload.description = `
Vi har en [bra guide](https://www.youtube.com/watch?v=dQw4w9WgXcQ) för sånt!
    `
  } else {
    payload.passed = true
    payload.title = "Hurra! HTTPs fungerar!"
    payload.description = "Internet __är__ *bättre* då."
  }

  await test.update(payload)
  await group.update({status: 'finished'})
}
