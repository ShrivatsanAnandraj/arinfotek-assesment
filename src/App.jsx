import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import LoginPage from './components/Auth/LoginPage'
import SignupPage from './components/Auth/SignupPage'
import HomePage from './components/Home/HomePage'
import TutorialPage from './components/Tutorial/TutorialPage'
import Workspace from './components/Workspace/Workspace'
import StudentDashboard from './components/Dashboard/StudentDashboard'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
        <div className="text-white text-xl font-bold">Loading...</div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
        <div className="text-white text-xl font-bold">Loading...</div>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to="/home" replace />
  }
  
  return children
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/tutorial/:language" element={<ProtectedRoute><TutorialPage /></ProtectedRoute>} />
          <Route path="/workspace" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
          <Route path="/workspace/:language" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
