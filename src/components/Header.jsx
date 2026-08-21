import React from 'react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center hover:opacity-90 transition">
          <img
            src="/arinfotek_logo.png"
            alt="AR INFOTEK"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </a>
      </div>
    </header>
  );
};

export default Header;
