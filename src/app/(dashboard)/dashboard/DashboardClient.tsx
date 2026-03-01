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
} from 'lucide-react';
import Link from 'next/link';
import type { User, Permission } from '@/types';

interface DashboardClientProps {
  user: User;
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

export default function DashboardClient({ user }: DashboardClientProps) {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
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
          className={`p-4 rounded-xl border flex items-center gap-3 ${
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

      {/* Feature Cards */}
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
    </div>
  );
}
