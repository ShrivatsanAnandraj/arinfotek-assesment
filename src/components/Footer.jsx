function Footer({ onAdminClick, screen }) {
  return (
    <footer className="bg-primary text-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-black text-white">AR INFOTEK</span>
          </div>
          <p className="text-sm text-slate-300">Practical, mentor-led online IT training to accelerate your career.</p>
        </div>
        <div>
          <h5 className="font-bold text-accent mb-4">Programs</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="https://arinfotek.co.in/#courses" className="hover:text-white">AWS Architect</a></li>
            <li><a href="https://arinfotek.co.in/#courses" className="hover:text-white">Data Science</a></li>
            <li><a href="https://arinfotek.co.in/#courses" className="hover:text-white">DevOps</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-accent mb-4">Company</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="https://arinfotek.co.in/#why" className="hover:text-white">Why Us</a></li>
            <li><a href="https://arinfotek.co.in/#internship" className="hover:text-white">Internship</a></li>
            <li><a href="https://arinfotek.co.in/#testimonials" className="hover:text-white">Testimonials</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-accent mb-4">Legal</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Terms</a></li>
            <li><a href="#" className="hover:text-white">Privacy</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-slate-400 mt-12 border-t border-white/10 pt-6 flex items-center justify-center gap-4">
        <span>&copy; 2025 AR INFOTEK &ndash; All rights reserved.</span>
        <button
          onClick={onAdminClick}
          className="text-primary hover:text-blue-900 transition underline font-semibold"
        >
          {screen === 'admin' ? 'Back to Test' : 'Admin'}
        </button>
      </div>
    </footer>
  );
}

export default Footer
