'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // 1. Jalankan hanya sekali saat client-side sudah siap
  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect

    // Cek localStorage atau preferensi sistem
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Mencegah error hidrasi (mismatch antara server & client)
  if (!mounted) return <div className="p-1 w-9 h-9" />;

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
      className="group relative p-1.5 w-9 h-9 flex items-center justify-center rounded-md overflow-hidden transition-all duration-300 
             hover:bg-gray-200 dark:hover:bg-neutral-800 
             border-2 border-foreground"
    >
      <Sun
        className={`w-5 h-5 absolute transition-all duration-500 fill-current text-yellow-500
      ${isDark ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}
      />

      <Moon
        className={`w-5 h-5 absolute transition-all duration-500 fill-current text-white
      ${isDark ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}
      />
    </button>
  );
};

export default DarkModeToggle;
