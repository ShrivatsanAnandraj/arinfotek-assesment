import { useState } from 'react';

export default function JoinCard({ onStart }) {
  const [name, setName] = useState('');
  const [registerId, setRegisterId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !registerId.trim() || !code.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tests?code=' + encodeURIComponent(code.trim()));
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Invalid test code');
        setLoading(false);
        return;
      }
      const data = await res.json();
      onStart({ student: { name: name.trim(), registerId: registerId.trim() }, test: data });
    } catch {
      setError('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 p-4 sm:p-7 md:p-10">
        <div className="text-center mb-5 sm:mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-accent/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3.5 sm:mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800">Online Assessment</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">Enter your details and test code to begin</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-3.5 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1.5">Register ID <span className="text-slate-400 font-normal">(as per college records)</span></label>
            <input
              type="text"
              value={registerId}
              onChange={(e) => setRegisterId(e.target.value)}
              placeholder="Enter your register ID"
              className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1.5">Test Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. APT01"
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 text-base font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 rounded-lg sm:rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-bold text-base bg-gradient-to-r from-accent to-orange-600 text-white shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking...' : 'Start Test'}
          </button>
        </form>
      </div>
    </div>
  );
}
