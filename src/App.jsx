import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import JoinCard from './components/JoinCard'
import TestRunner from './components/TestRunner'
import ResultCard from './components/ResultCard'

function App() {
  const [screen, setScreen] = useState('join')
  const [testData, setTestData] = useState(null)
  const [studentInfo, setStudentInfo] = useState(null)
  const [result, setResult] = useState(null)

  const handleStartTest = (data) => {
    setStudentInfo(data.student)
    setTestData(data.test)
    setScreen('test')
  }

  const handleSubmitTest = (resultData) => {
    setResult(resultData)
    setScreen('result')
  }

  const handleRetake = () => {
    setScreen('join')
    setTestData(null)
    setStudentInfo(null)
    setResult(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        {screen === 'join' && <JoinCard onStart={handleStartTest} />}
        {screen === 'test' && (
          <TestRunner
            testData={testData}
            studentInfo={studentInfo}
            onSubmit={handleSubmitTest}
          />
        )}
        {screen === 'result' && (
          <ResultCard
            result={result}
            studentInfo={studentInfo}
            testName={testData?.title}
            onRetake={handleRetake}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
