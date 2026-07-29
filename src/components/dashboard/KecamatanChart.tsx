'use client';

import { useEffect, useState } from 'react';
import { MapPin, BarChart3, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getPerKecamatanStats, type PerKecamatanData } from '@/lib/api';
import { KECAMATAN_LIST } from '@/config/kecamatan';
import DonutChart from './DonutChart';
import type { User } from '@/types';

interface KecamatanChartProps {
  user: User;
}

type LoadingState = 'loading' | 'ready' | 'error';

export default function KecamatanChart({ user }: KecamatanChartProps) {
  const isBpp = user.role === 'bpp';
  const userKecamatan = isBpp ? (user.kecamatan ?? KECAMATAN_LIST[0]) : KECAMATAN_LIST[0];

  const [selected, setSelected] = useState(userKecamatan);
  const [allData, setAllData] = useState<PerKecamatanData[]>([]);
  const [state, setState] = useState<LoadingState>('loading');

  useEffect(() => {
    const controller = new AbortController();
    getPerKecamatanStats(undefined, controller.signal)
      .then((data) => {
        setAllData(data);
        setState('ready');
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setState('error');
      });
    return () => controller.abort();
  }, []);

  const FERTILIZER_LABELS: Record<string, string> = {
    urea: 'Urea',
    npk: 'NPK',
    za: 'ZA',
    npk_formula: 'NPK Formula',
    organik: 'Organik',
  };

  const current = allData.find((d) => d.kecamatan === selected);
  const pupukData =
    current && current.reconciliation.distribusi_pupuk
      ? Object.entries(current.reconciliation.distribusi_pupuk)
          .filter(([, v]) => v.diajukan_kg > 0 || v.ditebus_kg > 0)
          .map(([key, val]) => ({
            name: FERTILIZER_LABELS[key] || key,
            Diajukan: val.diajukan_kg,
            Ditebus: val.ditebus_kg,
          }))
      : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Statistik Per Kecamatan
          </p>
        </div>
        {/* Dropdown */}
        <div className="relative w-56">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          {isBpp ? (
            <div className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 select-none cursor-not-allowed">
              {user.kecamatan || 'Kecamatan tidak diatur'}
            </div>
          ) : (
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-background appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {KECAMATAN_LIST.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {state === 'loading' && (
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {state === 'error' && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">Data tidak tersedia</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Pastikan server backend berjalan</p>
        </div>
      )}

      {state === 'ready' && current && (
        <div className="space-y-6">
          {current.data_terbatas && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-700 dark:text-yellow-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Data terbatas — belum ada arsip untuk kecamatan ini
            </div>
          )}

          {/* Status Penebusan */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-green-700 dark:text-green-400">
                {current.reconciliation.total_lengkap}
              </p>
              <p className="text-[10px] text-green-600 dark:text-green-500 font-medium">Lengkap</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                {current.reconciliation.total_sebagian}
              </p>
              <p className="text-[10px] text-yellow-600 dark:text-yellow-500 font-medium">
                Sebagian
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-red-700 dark:text-red-400">
                {current.reconciliation.total_melebihi}
              </p>
              <p className="text-[10px] text-red-600 dark:text-red-500 font-medium">Melebihi</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                {current.reconciliation.total_belum}
              </p>
              <p className="text-[10px] text-orange-600 dark:text-orange-500 font-medium">Belum</p>
            </div>
          </div>

          {/* Distribusi Pupuk + Klasifikasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bar Chart Pupuk */}
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Distribusi Pupuk (kg)
              </p>
              {pupukData.some((p) => p.Diajukan > 0 || p.Ditebus > 0) ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={pupukData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Diajukan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Ditebus" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-45 text-xs text-muted-foreground">
                  Belum ada data distribusi pupuk
                </div>
              )}
            </div>

            {/* Donut Klasifikasi */}
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 flex flex-col items-center">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide self-start">
                Hasil Klasifikasi
              </p>
              {current.classification.total_petani > 0 ? (
                <DonutChart
                  normal={current.classification.total_normal}
                  tidakNormal={current.classification.total_tidak_normal}
                  size={160}
                />
              ) : (
                <div className="flex items-center justify-center h-45 text-xs text-muted-foreground">
                  Belum ada klasifikasi
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
