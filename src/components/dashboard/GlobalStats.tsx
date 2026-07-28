'use client';

import { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, FileSpreadsheet, FlaskConical, Table, TrendingUp, Percent } from 'lucide-react';
import { getGlobalStats, type GlobalStatsData } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';

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
    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5 min-w-[140px] snap-start">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
          {label}
        </p>
        <p className="text-base font-bold text-foreground leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground truncate">{sub}</p>}
      </div>
    </div>
  );
}

export default function GlobalStats() {
  const [stats, setStats] = useState<GlobalStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    getGlobalStats(controller.signal)
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(getApiErrorMessage(err));
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse"
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

  const { reconciliation: rec, classification: cls, pupuk } = stats;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Ringkasan Global
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatItem
          icon={<FileSpreadsheet className="w-4 h-4 text-amber-600" />}
          label="Petani RDKK"
          value={rec.total_petani.toLocaleString('id-ID')}
          sub={`dari ${rec.total_rdkk_docs} arsip`}
          color="bg-amber-50 dark:bg-amber-900/20"
        />

        <StatItem
          icon={<Table className="w-4 h-4 text-purple-600" />}
          label="Petani Si-Verval"
          value={cls.total_petani.toLocaleString('id-ID')}
          sub={`dari ${cls.total_siverval_docs} arsip`}
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
          label="Akurasi Model"
          value={`${cls.rata_rata_akurasi}%`}
          sub="Rata-rata klasifikasi"
          color="bg-blue-50 dark:bg-blue-900/20"
        />

        <StatItem
          icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
          label="Normal"
          value={`${cls.rata_rata_persentase_normal}%`}
          sub="Rata-rata klasifikasi"
          color="bg-emerald-50 dark:bg-emerald-900/20"
        />

        <StatItem
          icon={<FlaskConical className="w-4 h-4 text-cyan-600" />}
          label="Diajukan"
          value={`${(pupuk.total_diajukan_kg / 1000).toFixed(1)} ton`}
          sub={`${pupuk.total_diajukan_kg.toLocaleString('id-ID')} kg`}
          color="bg-cyan-50 dark:bg-cyan-900/20"
        />

        <StatItem
          icon={<FlaskConical className="w-4 h-4 text-teal-600" />}
          label="Ditebus"
          value={`${(pupuk.total_ditebus_kg / 1000).toFixed(1)} ton`}
          sub={`${pupuk.total_ditebus_kg.toLocaleString('id-ID')} kg`}
          color="bg-teal-50 dark:bg-teal-900/20"
        />

        <StatItem
          icon={<Percent className="w-4 h-4 text-orange-600" />}
          label="Persentase Tebus"
          value={`${pupuk.persentase_tebus}%`}
          sub="Dari total diajukan"
          color="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>
    </div>
  );
}
