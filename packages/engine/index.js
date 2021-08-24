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

async function test_ipv4({ipv4}, {}) {
  if (ipv4) return succeeded('test_ipv4_success')
  return failed('test_ipv4_fail')
}

async function test_ip4_connectivity({}, {ipv4_record}) {
  if (ipv4_record) return succeeded('yes yo')
  return failed('because I said so')
}

const INPUTS = {
  'ipv4_lookup': async () => succeeded(true)
}

const TESTS = [
  {
    id: 'ipv4_record',
    inputs: ['ipv4_lookup'],
    dependencies: [],
    test: test_ipv4,
    title: {
      sv: 'IP Version 4',
      en: 'IP Version 4',
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

const EVENTS = {
  input: {
    load: 'input:load',
    loaded: 'input:loaded',
    failure: 'input:failure',
  }
}

class Engine extends EventEmitter {
  // Not quite tests, just results that are used for other tests
  inputs = {}

  // Test results
  cache = {}
  
  remaining_tests = Array.from(TESTS)

  async run() {
    while (true) {
      const current_tests = []

      for (let idx = 0; idx < this.remaining_tests.length; ++idx) {
        const test = this.remaining_tests[idx]
        if (test.dependencies.every(dep => this.cache.hasOwnProperty(dep))) {
          current_tests.push(test)
          this.remaining_tests.splice(idx, 1)
        }

        for (const input of test.inputs) {
          if (!this.inputs.hasOwnProperty(input)) {
            this.emit(EVENTS.input.load, {name: input, status: 'load'})
            await new Promise((resolve) => setTimeout(resolve, 1500))

            try {
              const res = await INPUTS[input]()
              this.inputs[input] = res
              this.emit(EVENTS.input.loaded, {name: input, status: 'success'})
            } catch (err) {
              this.emit(EVENTS.input.failure, {name: input, status: 'failure', err})
              break
            }
          }

          if (this.inputs[input].type !== 'success') {
            this.cache[test.id] = skipped(`input ${input} failed`)
            // This may fail if the arch of this code is changed, it depends on current test being the last
            current_tests.shift()
          }
        }

        for (const dep of test.dependencies) {
          if (!this.cache.hasOwnProperty(dep) || this.cache[dep].type !== 'success') {
            this.cache[test.id] = skipped(`dependency ${dep} failed`)
            current_tests.shift()
          }
        }
      }

      for (const test of current_tests) {
        // TODO: Slice cache and deps so that only requested data gets sent
        //       which forces every test author to specify deps properly
        this.cache[test.id] = await test.test(this.inputs, this.cache)
      }


      if (this.remaining_tests.length === 0) break
    }

    this.emit('results', this.cache)
    // console.log("Result: ", this.cache)
  }
}

module.exports = {
  Engine,
  EVENTS,
}