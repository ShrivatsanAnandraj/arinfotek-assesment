import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Code, LogOut, User, Home } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
        <Link to={user ? '/home' : '/login'} className="flex items-center hover:opacity-90 transition">
          <img
            src="/arinfotek_logo.png"
            alt="AR INFOTEK"
            className="h-8 sm:h-10 md:h-12 w-auto object-contain"
          />
        </Link>
        
        {user && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-100">
            <Link
              to="/home"
              className="px-4 py-1.5 text-xs lg:text-sm font-bold text-primary rounded-full hover:bg-white hover:shadow-md transition flex items-center gap-1"
            >
              <Home size={14} />
              Home
            </Link>
            <Link
              to="/workspace"
              className="px-4 py-1.5 text-xs lg:text-sm font-bold text-slate-600 rounded-full hover:bg-white hover:shadow-md transition flex items-center gap-1"
            >
              <Code size={14} />
              Workspace
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-1.5 text-xs lg:text-sm font-bold text-slate-600 rounded-full hover:bg-white hover:shadow-md transition flex items-center gap-1"
            >
              <User size={14} />
              Dashboard
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-sm font-medium text-slate-600">
                Hi, {user.username}!
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-500 rounded-full hover:bg-red-50 transition"
              >
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 text-xs font-bold text-white bg-primary rounded-full hover:bg-primary-dark transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
