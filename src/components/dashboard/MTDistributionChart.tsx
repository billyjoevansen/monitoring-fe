'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CalendarDays } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { getGlobalStats, type GlobalStatsData } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';

const MT_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'];

export default function MTDistributionChart() {
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
          <p className="text-sm font-medium text-muted-foreground">Data distribusi MT tidak tersedia</p>
        </div>
      </div>
    );
  }

  const distribusi = stats.demografi?.distribusi_mt;
  if (!distribusi || Object.keys(distribusi).length === 0) {
    return null;
  }

  const chartData = Object.entries(distribusi)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([mt, count]) => ({
      name: `${mt} MT`,
      Petani: count,
    }));

  if (chartData.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Distribusi Musim Tanam
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="Petani" radius={[6, 6, 0, 0]}>
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={MT_COLORS[idx % MT_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
