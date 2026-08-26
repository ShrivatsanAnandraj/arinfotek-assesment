import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { UserPlus, Eye, EyeOff, Code } from 'lucide-react'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const result = await signup(username, email, password)
    if (result.success) {
      navigate('/home')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary to-primary-dark">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">Start Learning!</h1>
            <p className="text-slate-500 mt-2">Create your account to begin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-accent to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  <UserPlus size={18} />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
