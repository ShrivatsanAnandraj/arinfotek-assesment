import React from 'react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        <a href="/" className="flex items-center hover:opacity-90 transition">
          <img
            src="/arinfotek_logo.png"
            alt="AR INFOTEK"
            className="h-9 md:h-11 w-auto object-contain"
          />
        </a>
        <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-100">
          <span className="px-4 py-1.5 text-xs lg:text-sm font-bold text-primary rounded-full bg-white shadow-md">
            Online Assessment
          </span>
        </nav>
      </div>
    </header>
  );
};

export default Header;
