import { useState } from 'react'
import { InterviewState } from './types'
import { questions } from './data/questions'
import { WelcomeScreen } from './components/WelcomeScreen'
import { CompletionScreen } from './components/CompletionScreen'
import { InterviewScreen } from './components/InterviewScreen'

function App() {
  const [state, setState] = useState<InterviewState>('welcome')
  const [candidateName, setCandidateName] = useState('')
  const [answeredCount, setAnsweredCount] = useState(0)

  const handleStart = (name: string) => {
    setCandidateName(name)
    setState('interview')
  }

  const handleComplete = (answered: number) => {
    setAnsweredCount(answered)
    setState('completed')
  }

  if (state === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />
  }

  if (state === 'completed') {
    return (
      <CompletionScreen
        answeredCount={answeredCount}
        totalQuestions={questions.length}
      />
    )
  }

  return (
    <InterviewScreen
      candidateName={candidateName}
      onComplete={handleComplete}
    />
  )
}

export default App
