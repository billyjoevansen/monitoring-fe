import React, { useState, useEffect, useRef } from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
  iconBg: string;
}

export default function StatCard({ icon, label, value, sub, gradient, iconBg }: StatCardProps) {
  // Ambil angka murni (misal "98.5%" jadi 98.5)
  const targetValue =
    typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) || 0 : value;
  const suffix = typeof value === 'string' && value.includes('%') ? '%' : '';

  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const duration = 1500; // 1.5 detik durasi animasi

  useEffect(() => {
    // Reset state saat targetValue berubah (ketika ganti data dashboard)
    const startValue = displayValue;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

      // Rumus Easing (Cubic Out) agar pelan di akhir
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = startValue + (targetValue - startValue) * easeOut;

      setDisplayValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue]); // Animasi terpicu otomatis setiap targetValue (data) berubah

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 ${gradient} transition-all duration-500`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
          <p className="text-3xl font-bold">
            {/* Format desimal: jika angka bulat tampilkan bulat, jika desimal tampilkan 1 angka belakang koma */}
            {Number.isInteger(targetValue) ? Math.floor(displayValue) : displayValue.toFixed(1)}
            {suffix}
          </p>
          {sub && <p className="text-xs opacity-70 transition-opacity duration-300">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 bg-current" />
    </div>
  );
}
