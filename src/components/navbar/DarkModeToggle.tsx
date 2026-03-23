'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // 1. Jalankan hanya sekali saat client-side sudah siap
  useEffect(() => {
    setMounted(true);

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
      className="p-1.5 rounded-md transition-all duration-300 
                 hover:bg-gray-100 dark:hover:bg-neutral-800 
                 border-2 border-gray-300 dark:border-neutral-700
                 text-gray-700 dark:text-yellow-400"
    >
      {isDark ? (
        <Moon className="w-5 h-5 fill-current transition-transform rotate-0 scale-100" />
      ) : (
        <Sun className="w-5 h-5 fill-current transition-transform rotate-0 scale-100" />
      )}
    </button>
  );
};

export default DarkModeToggle;
