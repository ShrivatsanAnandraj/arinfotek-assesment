import { Code, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/arinfotek_logo.png"
              alt="AR INFOTEK"
              className="h-6 w-auto object-contain brightness-0 invert"
            />
            <span className="text-sm text-slate-400">
              © 2025 AR INFOTEK – All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Made with</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>for learning</span>
            <Code size={14} className="text-accent" />
          </div>
        </div>
      </div>
    </footer>
  )
}
