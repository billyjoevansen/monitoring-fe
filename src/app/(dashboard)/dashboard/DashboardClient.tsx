'use client';

import { useEffect, useState } from 'react';
import { healthCheck } from '@/lib/api';
import { hasPermission, ROLE_LABELS } from '@/lib/rbac';
import {
  FileSearch,
  BrainCircuit,
  Settings,
  Users,
  ScrollText,
  CheckCircle,
  XCircle,
  Loader2,
  LayoutDashboard,
  Users2,
  TrendingUp,
  AlertTriangle,
  Cpu,
  CalendarDays,
  User2,
  ArrowRight,
  Store,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import type { User, Permission } from '@/types';
import type { ClassificationArchive, ReconciliationArchive } from '@/types/archive';
import DonutChart from '@/components/dashboard/DonutChart';

interface DashboardClientProps {
  user: User;
  latestClassification: ClassificationArchive | null;
  latestReconciliation: ReconciliationArchive | null;
}

interface FeatureCard {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  permission?: Permission;
  cardClass: string;
  iconClass: string;
}

export const features: FeatureCard[] = [
  {
    href: '/reconcile',
    icon: FileSearch,
    title: 'Rekonsiliasi',
    desc: 'Bandingkan data RDKK dengan SIVERVAL. Lihat selisih pupuk, kesesuaian kios, dan status penebusan.',
    permission: 'view_reconciliation',
    cardClass: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    iconClass: 'bg-blue-100',
  },
  {
    href: '/classify',
    icon: BrainCircuit,
    title: 'Klasifikasi',
    desc: 'Klasifikasikan data rekonsiliasi menjadi NORMAL / TIDAK NORMAL dengan model Random Forest.',
    permission: 'view_classification',
    cardClass: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100',
    iconClass: 'bg-indigo-100',
  },
  {
    href: '/settings',
    icon: Settings,
    title: 'Pengaturan Model',
    desc: 'Ubah hyperparameter Random Forest (n_estimators, max_depth, dll).',
    permission: 'edit_model_config',
    cardClass: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
    iconClass: 'bg-gray-200',
  },
  {
    href: '/users',
    icon: Users,
    title: 'Kelola User',
    desc: 'Tambah, ubah, dan kelola akun pengguna dalam sistem.',
    permission: 'manage_users',
    cardClass: 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100',
    iconClass: 'bg-teal-100',
  },
  {
    href: '/logs',
    icon: ScrollText,
    title: 'Log Aktivitas',
    desc: 'Pantau seluruh aktivitas pengguna dalam sistem.',
    permission: 'view_logs',
    cardClass: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
    iconClass: 'bg-orange-100',
  },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '–';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DashboardClient({
  user,
  latestClassification,
  latestReconciliation,
}: DashboardClientProps) {
  const [serverStatus, setServerStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  useEffect(() => {
    healthCheck()
      .then(() => setServerStatus('online'))
      .catch(() => setServerStatus('offline'));
  }, []);

  const visibleFeatures = features.filter((f) => {
    if (!f.permission) return true;
    return hasPermission(user.role, f.permission);
  });

  const canViewClassification = hasPermission(user.role, 'view_classification');
  const canViewReconciliation = hasPermission(user.role, 'view_reconciliation');

  const cls = latestClassification;
  const recon = latestReconciliation;

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Selamat datang, <strong>{user.nama}</strong> — {ROLE_LABELS[user.role]}
              {user.kecamatan && ` · Kec. ${user.kecamatan}`}
            </p>
          </div>
        </div>

        {/* Server Status — tetap client-side karena healthCheck adalah live ping */}
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 shrink-0 ${
            serverStatus === 'online'
              ? 'bg-green-50 border-green-200'
              : serverStatus === 'offline'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
          }`}
        >
          {serverStatus === 'loading' && <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />}
          {serverStatus === 'online' && <CheckCircle className="w-5 h-5 text-green-600" />}
          {serverStatus === 'offline' && <XCircle className="w-5 h-5 text-red-600" />}
          <p
            className={`text-sm font-semibold ${
              serverStatus === 'online'
                ? 'text-green-700'
                : serverStatus === 'offline'
                  ? 'text-red-700'
                  : 'text-gray-700'
            }`}
          >
            {serverStatus === 'loading' && 'Memeriksa koneksi server...'}
            {serverStatus === 'online' && 'Backend API aktif dan terhubung'}
            {serverStatus === 'offline' && 'API tidak terhubung'}
          </p>
        </div>
      </div>

      {/* ── Klasifikasi Section ────────────────────────────────────────── */}
      {canViewClassification && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-500" />
              Hasil Klasifikasi Terbaru
            </h2>
            <Link
              href="/classify"
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
            >
              Lihat semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {cls ? (
            <>
              {/* Stats Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Petani */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Users2 className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold uppercase opacity-75">Total Petani</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">
                    {cls.summary.total_petani.toLocaleString('id-ID')}
                  </p>
                </div>

                {/* Normal */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold uppercase opacity-75">Normal</p>
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    {cls.summary.normal.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    {cls.summary.persentase_normal.toFixed(1)}% dari total
                  </p>
                </div>

                {/* Tidak Normal */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold uppercase opacity-75">Anomali</p>
                  </div>
                  <p className="text-3xl font-bold text-red-700">
                    {cls.summary.tidak_normal.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-red-600 font-medium">
                    {cls.summary.persentase_tidak_normal.toFixed(1)}% dari total
                  </p>
                </div>

                {/* Akurasi Model */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-purple-600">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold uppercase opacity-75">Akurasi Model</p>
                  </div>
                  {cls.model_info ? (
                    <>
                      <p className="text-3xl font-bold text-purple-700">
                        {(cls.model_info.accuracy * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-purple-600 font-medium">
                        F1: {(cls.model_info.f1_score_weighted * 100).toFixed(1)}%
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-purple-400 mt-1">Tidak tersedia</p>
                  )}
                </div>
              </div>

              {/* Chart + Archive metadata */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-6">
                {/* Donut Chart */}
                <div className="flex flex-col items-center justify-center gap-3 md:w-48 shrink-0">
                  <DonutChart
                    normal={cls.summary.normal}
                    tidakNormal={cls.summary.tidak_normal}
                  />
                  {/* Legend */}
                  <div className="flex flex-col gap-1.5 w-full max-w-[160px]">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-green-400 shrink-0" />
                      <span className="text-gray-600">
                        Normal —{' '}
                        <strong className="text-gray-800">
                          {cls.summary.normal.toLocaleString('id-ID')}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-red-300 shrink-0" />
                      <span className="text-gray-600">
                        Anomali —{' '}
                        <strong className="text-gray-800">
                          {cls.summary.tidak_normal.toLocaleString('id-ID')}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px bg-gray-100 self-stretch" />

                {/* Archive details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400 mb-1">
                      Nama Arsip
                    </p>
                    <p className="text-base font-semibold text-gray-800">{cls.nama_arsip}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <User2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Dijalankan oleh</p>
                        <p className="text-sm font-medium text-gray-700">{cls.user_nama}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Tanggal</p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(cls.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick metrics */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-800">
                        {cls.summary.total_petani.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-600">
                        {cls.summary.persentase_normal.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">Normal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-red-500">
                        {cls.summary.persentase_tidak_normal.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">Anomali</p>
                    </div>
                  </div>

                  <Link
                    href="/classify"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <BrainCircuit className="w-4 h-4" />
                    Buka Halaman Klasifikasi
                  </Link>
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center">
                <BrainCircuit className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">Belum ada data klasifikasi</p>
                <p className="text-sm text-gray-400 mt-1">
                  Jalankan proses klasifikasi pertama untuk melihat statistik di sini.
                </p>
              </div>
              <Link
                href="/classify"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <BrainCircuit className="w-4 h-4" />
                Mulai Klasifikasi
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ── Rekonsiliasi Section ───────────────────────────────────────── */}
      {canViewReconciliation && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              Rekonsiliasi Terbaru
            </h2>
            <Link
              href="/reconcile"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
            >
              Lihat semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recon ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
              {/* Archive meta */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-gray-800">{recon.nama_arsip}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Oleh {recon.user_nama} · {formatDate(recon.created_at)}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-blue-700 self-start sm:self-auto">
                  {recon.summary.total_petani.toLocaleString('id-ID')} Petani
                </div>
              </div>

              {/* Status penebusan */}
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400 mb-2">
                  Status Penebusan
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-700">
                      {recon.summary.status_penebusan.tebus_lengkap.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">Tebus Lengkap</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-700">
                      {recon.summary.status_penebusan.tebus_sebagian.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-yellow-600 mt-0.5">Tebus Sebagian</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-700">
                      {recon.summary.status_penebusan.tebus_melebihi.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-red-600 mt-0.5">Tebus Melebihi</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-orange-700">
                      {recon.summary.status_penebusan.belum_menebus.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-orange-600 mt-0.5">Belum Menebus</p>
                  </div>
                </div>
              </div>

              {/* Kios compliance */}
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400 mb-2">
                  Kesesuaian Kios
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-700">
                        {recon.summary.kios.sesuai.toLocaleString('id-ID')} Sesuai
                      </p>
                      <p className="text-xs text-green-500">
                        {recon.summary.kios.persentase_sesuai.toFixed(1)}% kesesuaian
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-700">
                        {recon.summary.kios.tidak_sesuai.toLocaleString('id-ID')} Tidak Sesuai
                      </p>
                      <p className="text-xs text-purple-500">
                        {(() => {
                          const total = recon.summary.kios.sesuai + recon.summary.kios.tidak_sesuai;
                          return total > 0
                            ? `${((recon.summary.kios.tidak_sesuai / total) * 100).toFixed(1)}% tidak sesuai`
                            : '0.0% tidak sesuai';
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                <FileSearch className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">Belum ada data rekonsiliasi</p>
                <p className="text-sm text-gray-400 mt-1">
                  Upload data RDKK dan SIVERVAL untuk memulai rekonsiliasi.
                </p>
              </div>
              <Link
                href="/reconcile"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <FileSearch className="w-4 h-4" />
                Mulai Rekonsiliasi
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ── Feature Cards ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Menu Utama</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${feature.cardClass}`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.iconClass}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h2>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
