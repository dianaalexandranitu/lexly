import { useState } from 'react'
import Landing from './components/Landing.jsx'
import Questionnaire from './components/Questionnaire.jsx'
import Result from './components/Result.jsx'

export default function App() {
  const [screen, setScreen] = useState('landing') // landing | questionnaire | result
  const [answers, setAnswers] = useState({})
  const [generatedDocs, setGeneratedDocs] = useState(null)

  return (
    <div>
      {screen === 'landing' && (
        <Landing onStart={() => setScreen('questionnaire')} />
      )}
      {screen === 'questionnaire' && (
        <Questionnaire
          onComplete={(ans, docs) => {
            setAnswers(ans)
            setGeneratedDocs(docs)
            setScreen('result')
          }}
          onBack={() => setScreen('landing')}
        />
      )}
      {screen === 'result' && (
        <Result
          docs={generatedDocs}
          answers={answers}
          onRestart={() => {
            setAnswers({})
            setGeneratedDocs(null)
            setScreen('landing')
          }}
        />
      )}
    </div>
  )
}
