import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import JoinCard from './components/JoinCard'
import TestRunner from './components/TestRunner'
import ResultCard from './components/ResultCard'
import AdminPanel from './components/AdminPanel'
import SurveyTaker from './components/SurveyTaker'

function App() {
  const [screen, setScreen] = useState('join')
  const [testData, setTestData] = useState(null)
  const [studentInfo, setStudentInfo] = useState(null)
  const [result, setResult] = useState(null)
  const [showAdminAuth, setShowAdminAuth] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [survey, setSurvey] = useState(null)

  const handleStartTest = (data) => {
    setStudentInfo(data.student)
    setTestData(data.test)
    if (data.action === 'survey') {
      handleTakeSurveyDirect(data.test?.test_code)
    } else {
      setScreen('test')
    }
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

  const handleTakeSurveyDirect = async (testCode) => {
    try {
      const res = await fetch('/api/surveys?test_code=' + encodeURIComponent(testCode || ''))
      const data = await res.json()
      if (res.ok && data.surveys && data.surveys.length > 0) {
        setSurvey(data.surveys[0])
        setScreen('survey')
      } else {
        alert('No survey available for this test yet.')
        setScreen('join')
        setTestData(null)
        setStudentInfo(null)
      }
    } catch {
      alert('Failed to load survey. Please try again.')
      setScreen('join')
      setTestData(null)
      setStudentInfo(null)
    }
  }

  const handleTakeSurvey = async () => {
    await handleTakeSurveyDirect(testData?.test?.test_code)
  }

  const handleSurveyComplete = () => {
    setSurvey(null)
    setScreen('join')
    setTestData(null)
    setStudentInfo(null)
    setResult(null)
  }

  const handleAdminClick = () => {
    if (screen === 'admin') {
      setScreen('join')
      return
    }
    setShowAdminAuth(true)
    setAdminPassword('')
    setAdminError('')
  }

  const handleAdminAuth = (e) => {
    e.preventDefault()
    if (adminPassword === 'demo') {
      setShowAdminAuth(false)
      setScreen('admin')
    } else {
      setAdminError('Incorrect password')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 w-full flex items-center justify-center px-2.5 py-3 sm:px-5 sm:py-5 md:py-8">
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
            testCode={testData?.test?.test_code}
            onRetake={handleRetake}
            onTakeSurvey={handleTakeSurvey}
          />
        )}
        {screen === 'survey' && survey && (
          <SurveyTaker
            survey={survey}
            studentInfo={studentInfo}
            testCode={testData?.test?.test_code}
            onComplete={handleSurveyComplete}
          />
        )}
        {screen === 'admin' && <AdminPanel />}
      </main>
      <Footer onAdminClick={handleAdminClick} screen={screen} />

      {showAdminAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 max-w-sm w-full mx-auto my-auto text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Admin Access</h3>
            <p className="text-sm text-slate-500 mb-4">Enter the admin password to continue</p>
            <form onSubmit={handleAdminAuth} className="space-y-3">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              {adminError && (
                <p className="text-sm text-red-500">{adminError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdminAuth(false)}
                  className="flex-1 py-2.5 rounded-lg font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-accent to-orange-600 text-white shadow-md transition"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
