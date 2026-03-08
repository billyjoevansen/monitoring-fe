'use client';

import { useEffect, useState } from 'react';
import { healthCheck } from '@/lib/api';
import { hasPermission, ROLE_LABELS } from '@/lib/rbac';
import { formatDate } from '@/lib/format';
import {
  FileSearch,
  BrainCircuit,
  Settings,
  Users as UsersIcon,
  ScrollText,
  CheckCircle,
  XCircle,
  Loader2,
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  Activity,
  Database,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import type { User, Permission, ClassificationArchive, ReconciliationArchive } from '@/types';
import DonutChart from '@/components/dashboard/DonutChart';
import StatCard from '@/components/dashboard/StatCard';
import RekonSummaryCard from '@/components/dashboard/ReconSummary';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardClientProps {
  user: User;
  latestClassification: ClassificationArchive | null;
  latestReconciliation: ReconciliationArchive | null;
  totalClassifications: number;
  totalReconciliations: number;
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

// ─── Feature Cards ────────────────────────────────────────────────────────────

const features: FeatureCard[] = [
  {
    href: '/reconcile',
    icon: FileSearch,
    title: 'Rekonsiliasi',
    desc: 'Bandingkan data RDKK dengan SIVERVAL untuk validasi penyaluran pupuk.',
    permission: 'view_reconciliation',
    cardClass: 'bg-blue-50/80 text-blue-600 border-blue-200/60 hover:bg-blue-100 hover:shadow-md',
    iconClass: 'bg-blue-100',
  },
  {
    href: '/classify',
    icon: BrainCircuit,
    title: 'Klasifikasi',
    desc: 'Analisis data menggunakan model ML untuk deteksi anomali penyaluran.',
    permission: 'view_classification',
    cardClass:
      'bg-purple-50/80 text-purple-600 border-purple-200/60 hover:bg-purple-100 hover:shadow-md',
    iconClass: 'bg-purple-100',
  },
  {
    href: '/settings',
    icon: Settings,
    title: 'Pengaturan Model',
    desc: 'Konfigurasi parameter dan hyperparameter model machine learning.',
    permission: 'edit_model_config',
    cardClass: 'bg-gray-50/80 text-gray-600 border-gray-200/60 hover:bg-gray-100 hover:shadow-md',
    iconClass: 'bg-gray-100',
  },
  {
    href: '/users',
    icon: UsersIcon,
    title: 'Kelola Pengguna',
    desc: 'Tambah, ubah, dan kelola akun pengguna dalam sistem.',
    permission: 'manage_users',
    cardClass: 'bg-teal-50/80 text-teal-600 border-teal-200/60 hover:bg-teal-100 hover:shadow-md',
    iconClass: 'bg-teal-100',
  },
  {
    href: '/logs',
    icon: ScrollText,
    title: 'Log Aktivitas',
    desc: 'Pantau seluruh aktivitas pengguna dalam sistem.',
    permission: 'view_logs',
    cardClass:
      'bg-orange-50/80 text-orange-600 border-orange-200/60 hover:bg-orange-100 hover:shadow-md',
    iconClass: 'bg-orange-100',
  },
];

// ─── Skeleton Components ──────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-16 bg-gray-200 rounded" />
          <div className="h-3 w-28 bg-gray-200 rounded" />
        </div>
        <div className="w-11 h-11 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
      <div className="h-4 w-40 bg-gray-200 rounded mb-6" />
      <div className="flex justify-center">
        <div className="w-45 h-45 rounded-full bg-gray-200" />
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardClient({
  user,
  latestClassification,
  latestReconciliation,
  totalClassifications,
  totalReconciliations,
}: DashboardClientProps) {
  const [serverStatus, setServerStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  useEffect(() => {
    healthCheck()
      .then(() => setServerStatus('online'))
      .catch(() => setServerStatus('offline'));
  }, []);

  const canViewClassification = hasPermission(user.role, 'view_classification');
  const canViewReconciliation = hasPermission(user.role, 'view_reconciliation');

  const visibleFeatures = features.filter((f) => {
    if (!f.permission) return true;
    return hasPermission(user.role, f.permission);
  });

  const cls = latestClassification?.summary;

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Selamat datang, <strong>{user.nama}</strong> — {ROLE_LABELS[user.role]}
              {user.kecamatan && ` · Kec. ${user.kecamatan}`}
            </p>
          </div>
        </div>

        {/* Server Status Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            serverStatus === 'online'
              ? 'bg-green-50 border-green-200 text-green-700'
              : serverStatus === 'offline'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}
        >
          {serverStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
          {serverStatus === 'online' && <CheckCircle className="w-4 h-4" />}
          {serverStatus === 'offline' && <XCircle className="w-4 h-4" />}
          <span>
            {serverStatus === 'loading' && 'Memeriksa koneksi...'}
            {serverStatus === 'online' && 'API Terhubung'}
            {serverStatus === 'offline' && 'API Tidak Terhubung'}
          </span>
        </div>
      </div>

      {/* ── Statistics Overview ─────────────────────────────────────────────── */}
      {canViewClassification && latestClassification && cls ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<UsersIcon className="w-5 h-5 text-blue-600" />}
            label="Total Petani"
            value={cls.total_petani}
            sub="Data klasifikasi terakhir"
            gradient="bg-blue-50 border-blue-200 text-blue-900"
            iconBg="bg-blue-100"
          />
          <StatCard
            icon={<ShieldCheck className="w-5 h-5 text-green-600" />}
            label="Normal"
            value={cls.normal}
            sub={`${cls.persentase_normal}% dari total`}
            gradient="bg-green-50 border-green-200 text-green-900"
            iconBg="bg-green-100"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            label="Tidak Normal"
            value={cls.tidak_normal}
            sub={`${cls.persentase_tidak_normal}% dari total`}
            gradient="bg-red-50 border-red-200 text-red-900"
            iconBg="bg-red-100"
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-purple-600" />}
            label="Akurasi Model"
            value={
              latestClassification.model_info?.accuracy
                ? `${(latestClassification.model_info.accuracy * 100).toFixed(1)}%`
                : '—'
            }
            sub={
              latestClassification.model_info?.f1_score_weighted
                ? `F1: ${(latestClassification.model_info.f1_score_weighted * 100).toFixed(1)}%`
                : 'Belum tersedia'
            }
            gradient="bg-purple-50 border-purple-200 text-purple-900"
            iconBg="bg-purple-100"
          />
        </div>
      ) : canViewClassification /* Empty state for no data yet */ ? null : null}

      {/* ── Charts & Details Section ───────────────────────────────────────── */}
      {canViewClassification && latestClassification && cls ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Donut Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-4.5 h-4.5 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Distribusi Klasifikasi</h3>
            </div>
            <DonutChart normal={cls.normal} tidakNormal={cls.tidak_normal} />
          </div>

          {/* Classification Details */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BrainCircuit className="w-4.5 h-4.5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Klasifikasi Terakhir</h3>
                  <p className="text-xs text-gray-400">{latestClassification.nama_arsip}</p>
                </div>
              </div>
              <Link
                href="/classify"
                className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 space-y-5">
              {/* Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <UsersIcon className="w-3 h-3" /> Operator
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {latestClassification.user_nama}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Waktu
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {formatDate(latestClassification.created_at)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Database className="w-3 h-3" /> Total Data
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {cls.total_petani} petani
                  </p>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3.5">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium">Normal</p>
                    <p className="text-lg font-bold text-green-700">{cls.normal}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-red-50 rounded-xl p-3.5">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-red-600 font-medium">Anomali</p>
                    <p className="text-lg font-bold text-red-700">{cls.tidak_normal}</p>
                  </div>
                </div>
              </div>

              {/* Model Info */}
              {latestClassification.model_info && (
                <div className="bg-linear-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
                    Performa Model
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Akurasi</p>
                      <p className="text-sm font-bold text-gray-800">
                        {(latestClassification.model_info.accuracy * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">F1-Score</p>
                      <p className="text-sm font-bold text-gray-800">
                        {(latestClassification.model_info.f1_score_weighted * 100).toFixed(2)}%
                      </p>
                    </div>
                    {latestClassification.model_info.oob_score != null && (
                      <div>
                        <p className="text-xs text-gray-500">OOB Score</p>
                        <p className="text-sm font-bold text-gray-800">
                          {(latestClassification.model_info.oob_score * 100).toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : canViewClassification ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BrainCircuit className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Belum Ada Data Klasifikasi</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Lakukan rekonsiliasi terlebih dahulu, lalu jalankan klasifikasi untuk melihat statistik
            monitoring di dashboard.
          </p>
          <Link
            href="/classify"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm"
          >
            <BrainCircuit className="w-4 h-4" /> Mulai Klasifikasi
          </Link>
        </div>
      ) : null}

      {/* Reconciliation Summary */}
      {canViewReconciliation && latestReconciliation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RekonSummaryCard archive={latestReconciliation} />
          </div>

          {/* Archive Stats */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Ringkasan Arsip</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">{totalClassifications}</p>
                  <p className="text-xs text-purple-500">Arsip Klasifikasi</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileSearch className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{totalReconciliations}</p>
                  <p className="text-xs text-blue-500">Arsip Rekonsiliasi</p>
                </div>
              </div>

              <Link
                href="/archives/reconciliation"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-green-600 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                Lihat Arsip <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
