'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, FlaskConical } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getGlobalStats, type GlobalStatsData } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';

const FERTILIZER_LABELS: Record<string, string> = {
  urea: 'Urea',
  npk: 'NPK',
  za: 'ZA',
  npk_formula: 'NPK Formula',
  organik: 'Organik',
};

export default function FertilizerChart() {
  const [stats, setStats] = useState<GlobalStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getGlobalStats(controller.signal)
      .then(setStats)
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(getApiErrorMessage(err));
        setError(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 shadow-sm p-4">
        <div className="h-[220px] rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 shadow-sm p-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">Data pupuk tidak tersedia</p>
        </div>
      </div>
    );
  }

  const perJenis = stats.pupuk?.per_jenis;
  if (!perJenis || Object.keys(perJenis).length === 0) {
    return null;
  }

  const chartData = Object.entries(perJenis)
    .filter(([, v]) => v.diajukan_kg > 0 || v.ditebus_kg > 0)
    .map(([key, v]) => ({
      name: FERTILIZER_LABELS[key] || key,
      Diajukan: v.diajukan_kg,
      Ditebus: v.ditebus_kg,
    }));

  if (chartData.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical className="w-4 h-4 text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Distribusi Pupuk Global (kg)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            formatter={(value) => (value ?? 0).toLocaleString('id-ID')}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Diajukan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Ditebus" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
