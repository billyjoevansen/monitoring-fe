'use client';

import { FileSearch, CheckCircle, AlertTriangle, XCircle, MinusCircle } from 'lucide-react';
import type { ReconciliationArchive } from '@/types';
import { formatDate } from '@/lib/format';

interface RekonSummaryCardProps {
  archive: ReconciliationArchive;
}

interface StatusBarItem {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

export default function RekonSummaryCard({ archive }: RekonSummaryCardProps) {
  const { summary } = archive;
  const status = summary.status_penebusan;
  const kios = summary.kios;
  const total = summary.total_petani;

  const bars: StatusBarItem[] = [
    {
      label: 'Tebus Lengkap',
      value: status.tebus_lengkap,
      color: 'bg-green-500',
      icon: <CheckCircle className="w-3.5 h-3.5 text-green-600" />,
    },
    {
      label: 'Tebus Sebagian',
      value: status.tebus_sebagian,
      color: 'bg-amber-500',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
    },
    {
      label: 'Tebus Melebihi',
      value: status.tebus_melebihi,
      color: 'bg-red-500',
      icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
    },
    {
      label: 'Belum Menebus',
      value: status.belum_menebus,
      color: 'bg-gray-400',
      icon: <MinusCircle className="w-3.5 h-3.5 text-gray-500" />,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileSearch className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Rekonsiliasi Terakhir</h3>
            <p className="text-xs text-gray-400">{archive.nama_arsip}</p>
          </div>
        </div>
        <span className="text-xs text-gray-400">{formatDate(archive.created_at)}</span>
      </div>

      <div className="p-6 space-y-5">
        {/* Status Bars */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Status Penebusan
          </p>
          {bars.map((bar) => {
            const pct = total > 0 ? (bar.value / total) * 100 : 0;
            return (
              <div key={bar.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    {bar.icon} {bar.label}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {bar.value}{' '}
                    <span className="font-normal text-gray-400">({pct.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar.color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Kios Compliance */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Kesesuaian Kios
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-green-600">{kios.persentase_sesuai}%</span>
                <span className="text-xs text-gray-400">sesuai</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {kios.sesuai} dari {kios.sesuai + kios.tidak_sesuai} kios
              </p>
            </div>
            <div className="w-16 h-16 relative">
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="6"
                  strokeDasharray={`${(kios.persentase_sesuai / 100) * (2 * Math.PI * 26)} ${2 * Math.PI * 26}`}
                  strokeLinecap="round"
                  transform="rotate(-90 32 32)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
