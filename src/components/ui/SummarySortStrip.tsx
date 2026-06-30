'use client';

import { ArrowUp } from 'lucide-react';

interface SummarySortStripProps {
  total: number;
  normal: number;
  tidakNormal: number;
  persentaseNormal: number;
  persentaseTidakNormal: number;
  activeKey: string | null;
  onSort: (key: string | null) => void;
}

export default function SummarySortStrip({
  total,
  normal,
  tidakNormal,
  persentaseNormal,
  persentaseTidakNormal,
  activeKey,
  onSort,
}: SummarySortStripProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch bg-white dark:bg-slate-900 border border-border rounded-lg overflow-hidden text-sm mb-6">
      {/* Total Petani */}
      <button
        type="button"
        onClick={() => onSort(null)}
        className={`flex-1 px-4 py-2.5 text-center sm:border-r border-b sm:border-b-0 border-border transition-colors cursor-pointer ${
          activeKey === null
            ? 'bg-blue-50 dark:bg-blue-950/40'
            : 'hover:bg-muted/50'
        }`}
      >
        <p className="text-[11px] text-muted-foreground">Total Petani</p>
        <p className="text-xl font-bold mt-0.5">{total}</p>
        {activeKey === null && (
          <ArrowUp className="w-3 h-3 mx-auto mt-0.5 text-blue-500" />
        )}
      </button>

      {/* Normal */}
      <button
        type="button"
        onClick={() => onSort(activeKey === 'normal' ? null : 'normal')}
        className={`flex-1 px-4 py-2.5 text-center sm:border-r border-b sm:border-b-0 border-border transition-colors cursor-pointer ${
          activeKey === 'normal'
            ? 'bg-emerald-50 dark:bg-emerald-950/40'
            : 'bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40'
        }`}
      >
        <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Normal</p>
        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
          {normal} <span className="text-xs font-normal opacity-70">({persentaseNormal}%)</span>
        </p>
        {activeKey === 'normal' && (
          <ArrowUp className="w-3 h-3 mx-auto mt-0.5 text-emerald-600 dark:text-emerald-400" />
        )}
      </button>

      {/* Tidak Normal */}
      <button
        type="button"
        onClick={() => onSort(activeKey === 'tidak_normal' ? null : 'tidak_normal')}
        className={`flex-1 px-4 py-2.5 text-center transition-colors cursor-pointer ${
          activeKey === 'tidak_normal'
            ? 'bg-red-50 dark:bg-red-950/40'
            : 'bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40'
        }`}
      >
        <p className="text-[11px] text-red-700 dark:text-red-400">Tidak Normal</p>
        <p className="text-xl font-bold text-red-700 dark:text-red-400 mt-0.5">
          {tidakNormal}{' '}
          <span className="text-xs font-normal opacity-70">({persentaseTidakNormal}%)</span>
        </p>
        {activeKey === 'tidak_normal' && (
          <ArrowUp className="w-3 h-3 mx-auto mt-0.5 text-red-600 dark:text-red-400" />
        )}
      </button>
    </div>
  );
}
