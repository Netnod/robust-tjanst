const EventEmitter = require("events")

function skipped(data) {
  return {
    type: 'skip',
    data,
  }
}

function failed(data) {
  return {
    type: 'failure',
    data,
  }
}

function succeeded(data) {
  return {
    type: 'success',
    data
  }
}

async function test_ipv4({dns_query}, {}) {
  await new Promise(r => setTimeout(r, 1337))
  if (dns_query) return succeeded('test_ipv4_success')
  return failed('test_ipv4_fail')
}

async function test_ip4_connectivity({}, {ipv4_record}) {
  await new Promise(r => setTimeout(r, 1337))
  if (ipv4_record) return succeeded('yes yo')
  return failed('because I said so')
}

const INPUTS = {
  'dns_query': async () => {
    await new Promise(r => setTimeout(r, 1337))
    return succeeded(true)
  }
}

const TESTS = [
  {
    id: 'ipv4_record',
    inputs: ['dns_query'],
    dependencies: [],
    test: test_ipv4,
    title: {
      sv: 'IP Version 4 - DNS',
      en: 'IP Version 4 - DNS',
    },
  },
  {
    id: 'ipv4_connectivity',
    inputs: [],
    dependencies: ['ipv4_record'],
    test: test_ip4_connectivity,
    title: { 
      sv: 'IP Version 4 - Anslutning',
      en: 'IP Version 4 - Connection',
    },
  }
]


// TODO: Ensure/document that the `results` are always the final events
class Engine extends EventEmitter {
  // Not quite tests, just results that are used for other tests
  inputs = {}

  // Test results
  cache = {}
  
  remaining_tests = Array.from(TESTS)

  // TODO: Split into more functions?
  // TODO: Ensure this function cannot throw without emitting results
  async run() {
    const plan = this.remaining_tests.map(test => ({id: test.id, name: test.title.en, status: 'scheduled'}))
    this.emit('plan', plan)

    while (true) {
      const current_tests = []

      for (let idx = 0; idx < this.remaining_tests.length; ++idx) {
        const test = this.remaining_tests[idx]
        const name = test.title.en // TODO: Localisation

        if (test.dependencies.every(dep => this.cache.hasOwnProperty(dep))) {
          current_tests.push(test)
          this.remaining_tests.splice(idx, 1)
        }

        for (const input of test.inputs) {
          if (!this.inputs.hasOwnProperty(input)) {
            this.emit('input:update', {name: input, status: 'load'})

            try {
              const res = await INPUTS[input]()
              this.inputs[input] = res
              this.emit('input:update', {name: input, status: 'success'})
            } catch (err) {
              this.emit('input:update', {name: input, status: 'failure', err})
              break
            }
          }

          if (this.inputs[input].type !== 'success') {
            this.cache[test.id] = skipped(`input ${input} failed`)
            this.emit('test:update', {name, id: test.id, status: 'failure'})
            // This may fail if the arch of this code is changed, it depends on current test being the last
            current_tests.shift()
          }
        }

        for (const dep of test.dependencies) {
          if (!this.cache.hasOwnProperty(dep) || this.cache[dep].type !== 'success') {
            this.cache[test.id] = skipped(`dependency ${dep} failed`)
            this.emit('test:update', {name, id: test.id, status: 'failure'})
            current_tests.shift()
          }
        }
      }

      for (const test of current_tests) {
        const name = test.title.en // TODO: Localisation

        // TODO: Slice cache and deps so that only requested data gets sent
        //       which forces every test author to specify deps properly
        this.emit('test:update', {name, id: test.id, status: 'load'})

        try {
          this.cache[test.id] = await test.test(this.inputs, this.cache)
          this.emit('test:update', {name, id: test.id, status: 'success'})
        } catch (err) {
          this.emit('test:update', {name, id: test.id, status: 'failure', err})
          break
        }
      }


      if (this.remaining_tests.length === 0) break
    }

    this.emit('results', this.cache)
  }
}

module.exports = {
  Engine,
}