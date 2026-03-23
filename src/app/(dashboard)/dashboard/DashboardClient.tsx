'use client';

import { useEffect, useState } from 'react';
import { healthCheck } from '@/lib/api';
import { hasPermission, ROLE_LABELS } from '@/config/rbac';
import { formatDate } from '@/lib/format';
import {
  FileSearch,
  BrainCircuit,
  Users as UsersIcon,
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
import type { DashboardClientProps } from '@/types';
import DonutChart from '@/components/dashboard/DonutChart';
import StatCard from '@/components/dashboard/StatCard';
import RekonSummaryCard from '@/components/dashboard/ReconSummary';
import Hero from '@/components/ui/Hero';

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardClient({
  user,
  latestClassification,
  latestReconciliation,
  totalClassifications,
  totalReconciliations,
}: DashboardClientProps) {
  const [serverStatus, setServerStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => {
    healthCheck()
      .then(() => setServerStatus('online'))
      .catch(() => setServerStatus('offline'));
  }, []);

  const canViewDashboard = hasPermission(user.role, 'view_dashboard');
  // const canViewApi = hasPermission(user.role, 'view_api');

  const cls = latestClassification?.summary;

  return (
    <div className="space-y-8">
      {/* Server Status Indicator & Header */}
      <div className="fixed bottom-4 left-4 z-50 flex items-center group">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
          flex items-center cursor-pointer overflow-hidden transition-all duration-300 ease-in-out
          bg-black/90 backdrop-blur-md border border-white/10 shadow-2xl hover:bg-black
          ${isExpanded ? 'p-2 rounded-full' : 'p-2 rounded-xl'}
        `}
        >
          <div className="relative flex h-2.5 w-3.5 shrink-0">
            {serverStatus === 'online' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex ml-0.5 rounded-full h-2.5 w-2.5 ${
                serverStatus === 'online'
                  ? 'bg-emerald-500'
                  : serverStatus === 'offline'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
              }`}
            ></span>
          </div>
          <div
            className={`
          flex items-center transition-all duration-300 ease-in-out
          ${isExpanded ? 'ml-3 opacity-100 max-w-50' : 'ml-0 opacity-0 max-w-0'}
        `}
          >
            <span className="text-[11px] font-bold tracking-wider text-white/90 font-mono whitespace-nowrap uppercase">
              {serverStatus === 'loading' ? 'Syncing...' : `API ${serverStatus}`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Hero
        icon={<LayoutDashboard className="w-10 h-10 text-white" />}
        title="Dashboard"
        subtitle={`Selamat datang, ${user.nama} — ${ROLE_LABELS[user.role]}${user.kecamatan ? ` · Kec. ${user.kecamatan}` : ''}`}
        className="bg-background dark:bg-slate-900"
      />
      {/* ── Statistics Overview ─────────────────────────────────────────────── */}
      {canViewDashboard && latestClassification && cls ? (
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
      ) : canViewDashboard /* Empty state for no data yet */ ? null : null}

      {/* ── Charts & Details Section ───────────────────────────────────────── */}
      {canViewDashboard && latestClassification && cls ? (
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
      ) : canViewDashboard ? (
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
    </div>
  );
}
