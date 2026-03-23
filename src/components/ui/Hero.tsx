import React, { useState, useEffect } from 'react';

const svgPatterns = [
  `radial-gradient(#e5e7eb 0.8px, transparent 10px)`, // Dots
  `linear-gradient(#e5e7eb 0.5px, transparent 0.5px), linear-gradient(90deg, #e5e7eb 0.5px, transparent 0.5px)`, // Grid
  `linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 75%, #f3f4f6 75%, #f3f4f6)`, // Stripes
];

const darkPatterns = [
  `radial-gradient(#1e293b 0.8px, transparent 10px)`,
  `linear-gradient(#1e293b 0.5px, transparent 0.5px), linear-gradient(90deg, #1e293b 0.5px, transparent 0.5px)`,
  `linear-gradient(45deg, #0f172a 25%, transparent 25%, transparent 75%, #0f172a 75%, #0f172a)`,
];

interface HeroProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function Hero({ title, subtitle, icon, className = '' }: HeroProps) {
  const [bgStyle, setBgStyle] = useState({ light: '', dark: '' });

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * svgPatterns.length);
    setBgStyle({
      light: svgPatterns[randomIdx],
      dark: darkPatterns[randomIdx],
    });
  }, []);

  return (
    <section
      className={`relative py-12 px-6 border-b border-black dark:border-slate-800 transition-colors ${className}`}
      style={
        {
          backgroundImage: `var(--current-pattern)`,
          backgroundSize: '24px 24px',
        } as React.CSSProperties
      }
    >
      {/* Logic CSS Variable untuk Pattern */}
      <style>{`
        section { --current-pattern: ${bgStyle.light}; }
        .dark section { --current-pattern: ${bgStyle.dark}; }
      `}</style>

      <div className="relative z-10 max-w-7xl mx-auto flex items-center gap-5">
        {icon && (
          <div className="shrink-0 p-3 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl shadow-blue-200/50 shadow-lg dark:shadow-none">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
            {title}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-slate-400 text-lg">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
