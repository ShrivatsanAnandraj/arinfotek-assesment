import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { BookOpen, Code, Clock, Trophy, Folder, ArrowRight, TrendingUp } from 'lucide-react'
import { languages } from '../Languages/languages'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalTime: 0,
    tutorialsCompleted: 0,
    codeRuns: 0,
    languagesStarted: 0
  })
  const [savedFiles, setSavedFiles] = useState([])
  const [progress, setProgress] = useState({})

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('codelearn_stats')
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }

    // Load saved files
    const files = localStorage.getItem('codelearn_files')
    if (files) {
      setSavedFiles(JSON.parse(files))
    }

    // Load progress for each language
    const allProgress = {}
    languages.forEach(lang => {
      const saved = localStorage.getItem(`codelearn_progress_${lang.id}`)
      if (saved) {
        const completed = JSON.parse(saved)
        allProgress[lang.id] = {
          completed: completed.length,
          total: lang.topics.length,
          percentage: Math.round((completed.length / lang.topics.length) * 100)
        }
      }
    })
    setProgress(allProgress)
  }, [])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const languagesStarted = Object.keys(progress).length

  return (
    <div className="min-h-[calc(100vh-120px)] bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 sm:p-8 text-white mb-8">
          <h1 className="text-2xl sm:text-3xl font-black mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-blue-200">
            Keep up the great work! Here's your learning progress.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="text-primary" size={24} />
            </div>
            <p className="text-2xl font-black text-slate-800">{stats.tutorialsCompleted}</p>
            <p className="text-sm text-slate-500">Topics Completed</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <Code className="text-accent" size={24} />
            </div>
            <p className="text-2xl font-black text-slate-800">{stats.codeRuns}</p>
            <p className="text-sm text-slate-500">Code Runs</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
              <Clock className="text-green-500" size={24} />
            </div>
            <p className="text-2xl font-black text-slate-800">{formatTime(stats.totalTime)}</p>
            <p className="text-sm text-slate-500">Time Spent</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="text-purple-500" size={24} />
            </div>
            <p className="text-2xl font-black text-slate-800">{languagesStarted}</p>
            <p className="text-sm text-slate-500">Languages Started</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Language Progress */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Trophy size={18} className="text-accent" />
                Language Progress
              </h2>
              <Link to="/home" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            
            {Object.keys(progress).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">You haven't started any languages yet</p>
                <Link
                  to="/home"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition"
                >
                  Start Learning
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(progress).map(([langId, prog]) => {
                  const lang = languages.find(l => l.id === langId)
                  return (
                    <Link
                      key={langId}
                      to={`/tutorial/${langId}`}
                      className="block p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang?.icon}</span>
                          <span className="font-bold text-slate-800">{lang?.name}</span>
                        </div>
                        <span className="text-sm font-bold text-primary">{prog.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${prog.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {prog.completed} of {prog.total} topics completed
                      </p>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Saved Files */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Folder size={18} className="text-primary" />
                Saved Files
              </h2>
              <Link to="/workspace" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                Open Workspace <ArrowRight size={14} />
              </Link>
            </div>
            
            {savedFiles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">No saved files yet</p>
                <Link
                  to="/workspace"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent-dark transition"
                >
                  Start Coding
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedFiles.slice(0, 5).map((file) => {
                  const lang = languages.find(l => l.id === file.language)
                  return (
                    <Link
                      key={file.id}
                      to={`/workspace/${file.language}`}
                      className="block p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang?.icon || '📄'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">
                            {lang?.name} • {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
                {savedFiles.length > 5 && (
                  <p className="text-center text-sm text-slate-500">
                    + {savedFiles.length - 5} more files
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
          <h2 className="font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              to="/home"
              className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl hover:bg-primary/10 transition"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="text-primary" size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Browse Languages</p>
                <p className="text-xs text-slate-500">Explore available courses</p>
              </div>
            </Link>
            
            <Link
              to="/workspace"
              className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl hover:bg-accent/10 transition"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Code className="text-accent" size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Open Workspace</p>
                <p className="text-xs text-slate-500">Start coding now</p>
              </div>
            </Link>
            
            <Link
              to="/dashboard"
              className="flex items-center gap-3 p-4 bg-green-500/5 rounded-xl hover:bg-green-500/10 transition"
            >
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">View Stats</p>
                <p className="text-xs text-slate-500">Track your progress</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
