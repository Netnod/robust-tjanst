const React = require('react')
const {render, Text, Newline, Box} = require('ink')
const {Task, TaskList} = require('ink-task-list')
const {useImmer} = require('use-immer')

const {EVENTS} = require('engine')

function statusToState(status) {
  switch (status) {
    case 'load': return 'loading'
    case 'success': return 'success'
    case 'failure': return 'error'
    default: throw `Unknown status ${status}`
  }
}

const App = ({engine}) => {
  const [inputs, setInputs] = useImmer({})


  React.useEffect(
    () => {
      function onInput({name, status}) {
        setInputs(draft => {
          draft[name] = {status, name}
        })
      }

      engine.on(EVENTS.input.load, onInput)
      engine.on(EVENTS.input.loaded, onInput)
      engine.on(EVENTS.input.failure, onInput)
    },
    []
  )


  React.useEffect(
    () => {
      engine.run()
    }, 
    []
  )

  return (
    <Box flexDirection="column">
      <Text bold>
        Robust Service
        <Newline />
      </Text>
      <TaskList >
        {Object.values(inputs).map(({name, status}) => (
          <Task key={name} label={name} state={statusToState(status)} />
        ))}
      </TaskList>
    </Box>
  )
}

module.exports = function renderApp(engine) {
  render(<App engine={engine} />)
}