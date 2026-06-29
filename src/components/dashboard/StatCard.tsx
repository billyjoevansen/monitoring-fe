import React, { useEffect, useState } from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
  iconBg: string;
}

export default function StatCard({ icon, label, value, sub, gradient, iconBg }: StatCardProps) {
  const numericValue =
    typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) || 0 : value;

  const suffix = typeof value === 'string' && value.includes('%') ? '%' : '';

  const [display, setDisplay] = useState(0);

  /**
   * Lightweight animation:
   * - max 20 steps (bukan 60fps)
   * - tidak pakai RAF
   * - tidak agresif rerender
   */
  useEffect(() => {
    if (!numericValue) {
      setDisplay(0);
      return;
    }

    const steps = 20;
    const duration = 600; // ms
    const increment = numericValue / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;

      if (step >= steps) {
        setDisplay(numericValue);
        clearInterval(interval);
      } else {
        setDisplay(current);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [numericValue]);

  const formatted = Number.isInteger(numericValue) ? Math.round(display) : display.toFixed(1);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-3 ${gradient} transition-shadow duration-300 hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>

          <p className="text-3xl font-bold">
            {formatted}
            {suffix}
          </p>

          {sub && <p className="text-xs opacity-70 transition-opacity duration-200">{sub}</p>}
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-5 bg-current" />
    </div>
  );
}
