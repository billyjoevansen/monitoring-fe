import {
  BrainCircuit,
  Users as UsersIcon,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  Activity,
  Database,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';
import type { ClassificationArchive } from '@/types';

import StatCard from '@/components/dashboard/StatCard';
import DonutChart from '@/components/dashboard/DonutChart';
import MetaInfoGrid from '@/components/dashboard/MetaInfoGrid';
import ModelPerformancePanel from '@/components/dashboard/ModelPerformancePanel';
import EmptySlide from './EmptySlide';

export default function ClassificationSlide({ data }: { data: ClassificationArchive | null }) {
  if (!data) {
    return (
      <EmptySlide
        icon={<BrainCircuit className="w-8 h-8 text-purple-500" />}
        title="Belum Ada Data Klasifikasi"
        description="Lakukan rekonsiliasi terlebih dahulu, lalu jalankan klasifikasi untuk melihat statistik di sini."
        link={{
          href: '/classify',
          label: 'Mulai Klasifikasi',
          icon: <BrainCircuit className="w-4 h-4" />,
        }}
        bg="bg-purple-100"
      />
    );
  }

  const { summary: cls, model_info } = data;

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<UsersIcon className="w-5 h-3 text-blue-600" />}
          label="Total Petani"
          value={cls.total_petani}
          sub="Data klasifikasi terakhir"
          gradient="bg-blue-50 border-blue-200 text-blue-900"
          iconBg="bg-blue-100"
        />

        <StatCard
          icon={<ShieldCheck className="w-5 h-3 text-green-600" />}
          label="Normal"
          value={cls.normal}
          sub={`${cls.persentase_normal}% dari total`}
          gradient="bg-green-50 border-green-200 text-green-900"
          iconBg="bg-green-100"
        />

        <StatCard
          icon={<AlertTriangle className="w-5 h-3 text-red-600" />}
          label="Tidak Normal"
          value={cls.tidak_normal}
          sub={`${cls.persentase_tidak_normal}% dari total`}
          gradient="bg-red-50 border-red-200 text-red-900"
          iconBg="bg-red-100"
        />

        <StatCard
          icon={<Activity className="w-5 h-3 text-purple-600" />}
          label="Akurasi Model"
          value={model_info ? `${(model_info.accuracy * 100).toFixed(1)}%` : '—'}
          sub={
            model_info
              ? `F1: ${(model_info.f1_score_weighted * 100).toFixed(1)}%`
              : 'Belum tersedia'
          }
          gradient="bg-purple-50 border-purple-200 text-purple-900"
          iconBg="bg-purple-100"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Donut */}
        <div className="lg:col-span-2 bg-background rounded-2xl border border-gray-200 shadow-sm p-2">
          <div className="flex bg-gray-100 dark:bg-slate-800 items-center rounded-lg gap-2 mb-6 p-1">
            <BarChart3 className="w-4.5 h-4.5 text-foreground" />
            <h3 className="text-sm font-bold text-foreground">Distribusi Klasifikasi</h3>
          </div>
          <DonutChart normal={cls.normal} tidakNormal={cls.tidak_normal} />
        </div>

        {/* Detail */}
        <div className="lg:col-span-3 bg-background rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                <BrainCircuit className="w-4.5 h-4.5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Klasifikasi Terakhir</h3>
                <p className="text-xs text-muted-foreground">{data.nama_arsip}</p>
              </div>
            </div>

            <Link
              href="/archives/classification"
              className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-3 space-y-5">
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
                {
                  icon: <Database className="w-3 h-3" />,
                  label: 'Total Data',
                  value: `${cls.total_petani} petani`,
                },
              ]}
            />
            {model_info && <ModelPerformancePanel modelInfo={model_info} />}
          </div>
        </div>
      </div>
    </div>
  );
}
