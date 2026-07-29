import { FileStack, Users as UsersIcon, ArrowRight, Clock, MapPin, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatDate } from '@/lib/format';
import type { ReconciliationArchive } from '@/types';

import MetaInfoGrid from '@/components/dashboard/MetaInfoGrid';
import EmptySlide from './EmptySlide';

const STATUS_CONFIG = [
  { key: 'tebus_lengkap', label: 'Lengkap', color: '#22c55e', gradientTo: '#4ade80' },
  { key: 'tebus_sebagian', label: 'Sebagian', color: '#eab308', gradientTo: '#facc15' },
  { key: 'tebus_melebihi', label: 'Melebihi', color: '#ef4444', gradientTo: '#f87171' },
  { key: 'belum_menebus', label: 'Belum', color: '#f97316', gradientTo: '#fb923c' },
] as const;

interface TooltipPayloadItem {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl px-4 py-3 min-w-35">
      <p className="text-xs font-bold text-foreground mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.name}</span>
          </div>
          <span className="text-xs font-semibold text-foreground">{entry.value} petani</span>
        </div>
      ))}
    </div>
  );
}

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

  const chartData = STATUS_CONFIG.map(({ key, label }) => ({
    name: label,
    value: rec.status_penebusan[key],
  }));

  return (
    <div className="space-y-6">
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

          {/* Chart */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Distribusi Status Penebusan
              </p>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 16, left: 10, bottom: 5 }}
                  barCategoryGap="25%"
                >
                  <defs>
                    {STATUS_CONFIG.map((s) => (
                      <linearGradient
                        key={`grad-${s.key}`}
                        id={`grad-${s.key}`}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor={s.color} />
                        <stop offset="100%" stopColor={s.gradientTo} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.06)', radius: 6 }}
                  />
                  <Bar
                    dataKey="value"
                    name="Petani"
                    radius={[0, 6, 6, 0]}
                    barSize={24}
                    cursor="pointer"
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#grad-${STATUS_CONFIG[index].key})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
