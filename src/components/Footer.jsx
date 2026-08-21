function Footer({ onAdminClick, screen }) {
  return (
    <footer className="bg-primary text-slate-200 py-8">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <span className="text-2xl font-black text-white">AR INFOTEK</span>
        <p className="text-sm text-slate-300 mt-3">
          Practical, mentor-led online IT training to accelerate your career.
        </p>
        <div className="text-xs text-slate-400 mt-6 border-t border-white/10 pt-4 flex items-center justify-center gap-4">
          <span>&copy; 2025 AR INFOTEK &ndash; All rights reserved.</span>
          <button
            onClick={onAdminClick}
            className="text-slate-500 hover:text-white transition underline"
          >
            {screen === 'admin' ? 'Back to Test' : 'Admin'}
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer
