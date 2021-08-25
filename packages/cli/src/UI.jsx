const React = require('react')
const {render, Text, Newline, Box} = require('ink')
const {Task, TaskList} = require('ink-task-list')
const {useImmer} = require('use-immer')

function statusToState(status) {
  switch (status) {
    case 'load': return 'loading'
    case 'success': return 'success'
    case 'failure': return 'error'
    case 'scheduled': return 'pending'
    default: throw `Unknown status ${status}`
  }
}

const App = ({engine}) => {
  const [inputs, setInputs] = useImmer({})
  const [tests, setTests] = useImmer({})


  React.useEffect(
    () => {
      function onInput({name, status}) {
        setInputs(draft => {
          draft[name] = {status, name}
        })
      }

      engine.on('input:update', onInput)
    },
    []
  )

  React.useEffect(
    () => {
      function onTest({id, name, status}) {
        setTests(draft => {
          draft[id] = {id, status, name}
        })
      }

      engine.on('test:update', onTest)
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

      <TaskList>
        {Object.values(inputs).map(({name, status}) => (
          <Task key={name} label={name} state={statusToState(status)} />
        ))}
        {Object.values(tests).map(({id, name, status}) => (
          <Task key={id} label={name} state={statusToState(status)} />
        ))}
      </TaskList>
    </Box>
  )
}

module.exports = function renderApp(engine) {
  render(<App engine={engine} />)
}