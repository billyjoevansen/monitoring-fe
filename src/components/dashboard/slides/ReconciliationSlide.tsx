import {
  FileStack,
  Users as UsersIcon,
  ShieldCheck,
  AlertTriangle,
  Activity,
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';
import type { ReconciliationArchive } from '@/types';

import StatCard from '@/components/dashboard/StatCard';
import MetaInfoGrid from '@/components/dashboard/MetaInfoGrid';
import EmptySlide from './EmptySlide';

const STATUS_ROWS = [
  { key: 'tebus_lengkap', label: 'Tebus Lengkap', color: 'bg-green-500' },
  { key: 'tebus_sebagian', label: 'Tebus Sebagian', color: 'bg-yellow-500' },
  { key: 'tebus_melebihi', label: 'Tebus Melebihi', color: 'bg-red-500' },
  { key: 'belum_menebus', label: 'Belum Menebus', color: 'bg-orange-500' },
] as const;

export default function ReconciliationSlide({ data }: { data: ReconciliationArchive | null }) {
  if (!data) {
    return (
      <EmptySlide
        icon={<FileStack className="w-8 h-8 text-amber-500" />}
        title="Belum Ada Data Rekonsiliasi"
        description="Upload file RDKK dan SIVERVAL untuk memulai rekonsiliasi pertama Anda."
        link={{
          href: '/reconcile',
          label: 'Mulai Rekonsiliasi',
          icon: <FileStack className="w-4 h-4" />,
        }}
        bg="bg-amber-100"
      />
    );
  }

  const rec = data.summary;
  const total = rec.total_petani;

  const pct = (value: number) => (total > 0 ? ((value / total) * 100).toFixed(1) : '—');

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<UsersIcon className="w-5 h-5 text-blue-600" />}
          label="Total Petani"
          value={total}
          sub="Rekonsiliasi terakhir"
          gradient="bg-blue-50 border-blue-200 text-blue-900"
          iconBg="bg-blue-100"
        />

        <StatCard
          icon={<ShieldCheck className="w-5 h-5 text-green-600" />}
          label="Tebus Lengkap"
          value={rec.status_penebusan.tebus_lengkap}
          sub={`${pct(rec.status_penebusan.tebus_lengkap)}%`}
          gradient="bg-green-50 border-green-200 text-green-900"
          iconBg="bg-green-100"
        />

        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-yellow-600" />}
          label="Tebus Sebagian"
          value={rec.status_penebusan.tebus_sebagian}
          sub={`${pct(rec.status_penebusan.tebus_sebagian)}%`}
          gradient="bg-yellow-50 border-yellow-200 text-yellow-900"
          iconBg="bg-yellow-100"
        />

        <StatCard
          icon={<Activity className="w-5 h-5 text-orange-600" />}
          label="Belum Menebus"
          value={rec.status_penebusan.belum_menebus}
          sub={`${pct(rec.status_penebusan.belum_menebus)}%`}
          gradient="bg-orange-50 border-orange-200 text-orange-900"
          iconBg="bg-orange-100"
        />
      </div>

      {/* Detail */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <FileStack className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Rekonsiliasi Terakhir</h3>
              <p className="text-xs text-muted-foreground">{data.nama_arsip}</p>
            </div>
          </div>

          <Link
            href="/archives/reconciliation"
            className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Meta */}
          <div className="space-y-3">
            <MetaInfoGrid
              items={[
                {
                  icon: <UsersIcon className="w-3 h-3" />,
                  label: 'Operator',
                  value: data.user_nama,
                },
                {
                  icon: <Clock className="w-3 h-3" />,
                  label: 'Waktu',
                  value: formatDate(data.created_at),
                },
              ]}
            />

            {data.kecamatan && (
              <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                <MapPin className="w-3.5 h-3.5" />
                <span>{data.kecamatan}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-green-600">Total Diajukan</p>
                <p className="text-sm font-bold text-green-700">
                  {rec.total_pupuk_diajukan_kg?.toLocaleString('id-ID')} kg
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-600">Total Ditebus</p>
                <p className="text-sm font-bold text-blue-700">
                  {rec.total_pupuk_ditebus_kg?.toLocaleString('id-ID')} kg
                </p>
              </div>
            </div>
          </div>

          {/* Bars */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Distribusi Status Penebusan
            </p>

            {STATUS_ROWS.map(({ key, label, color }) => {
              const value = rec.status_penebusan[key];
              const barPct = total > 0 ? (value / total) * 100 : 0;

              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">
                      {value}{' '}
                      <span className="text-muted-foreground font-normal">
                        ({barPct.toFixed(1)}%)
                      </span>
                    </span>
                  </div>

                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`${color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
