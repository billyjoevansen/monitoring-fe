'use client';

import { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, FileStack, BrainCircuit, TrendingUp } from 'lucide-react';
import { getGlobalStats, type GlobalStatsData } from '@/lib/api';

function StatItem({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide truncate">
          {label}
        </p>
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
      </div>
    </div>
  );
}

export default function GlobalStats() {
  const [stats, setStats] = useState<GlobalStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    getGlobalStats()
      .then((data) => {
        if (mounted) setStats(data);
      })
      .catch(() => {
        if (mounted) setError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Ringkasan Global
          </p>
        </div>
        <div className="flex items-center justify-center py-6 text-center">
          <div>
            <BarChart3 className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Statistik tidak tersedia</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Pastikan server backend sedang berjalan
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { reconciliation: rec, classification: cls } = stats;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Ringkasan Global
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatItem
          icon={<FileStack className="w-4 h-4 text-amber-600" />}
          label="Arsip Rekonsiliasi"
          value={rec.total_archives}
          sub={`${rec.total_petani.toLocaleString('id-ID')} petani`}
          color="bg-amber-50 dark:bg-amber-900/20"
        />

        <StatItem
          icon={<BrainCircuit className="w-4 h-4 text-purple-600" />}
          label="Arsip Klasifikasi"
          value={cls.total_archives}
          sub={`${cls.total_petani.toLocaleString('id-ID')} petani`}
          color="bg-purple-50 dark:bg-purple-900/20"
        />

        <StatItem
          icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
          label="Transaksi Lengkap"
          value={rec.total_lengkap.toLocaleString('id-ID')}
          sub={`${rec.persentase_lengkap}% dari total`}
          color="bg-green-50 dark:bg-green-900/20"
        />

        <StatItem
          icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
          label="Rata-rata Akurasi"
          value={`${cls.rata_rata_akurasi}%`}
          sub="Model klasifikasi"
          color="bg-blue-50 dark:bg-blue-900/20"
        />

        <StatItem
          icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
          label="Rata-rata Normal"
          value={`${cls.rata_rata_persentase_normal}%`}
          sub="Dari seluruh klasifikasi"
          color="bg-emerald-50 dark:bg-emerald-900/20"
        />
      </div>
    </div>
  );
}
