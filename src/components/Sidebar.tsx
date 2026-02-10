'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileSearch,
  BrainCircuit,
  FlaskConical,
  Settings,
  Users,
  ScrollText,
  Wheat,
  LogOut,
  KeyRound,
  MapPin,
  Archive,
  ChevronDown,
  ChevronRight,
  FileStack,
  Tags,
} from 'lucide-react';
import { hasPermission } from '@/lib/rbac';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/rbac';
import { logout } from '@/lib/auth';
import type { User } from '@/types';
import type { Permission } from '@/types';

interface SidebarProps {
  user: User;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/reconcile',
    label: 'Rekonsiliasi',
    icon: FileSearch,
    permission: 'view_reconciliation',
  },
  { href: '/classify', label: 'Klasifikasi', icon: Tags, permission: 'view_classification' },
  {
    href: '/training',
    label: 'Training & Testing',
    icon: FlaskConical,
    permission: 'view_training',
  },
  {
    href: '#arsip',
    label: 'Arsip',
    icon: Archive,
    children: [
      { href: '/archives/reconciliation', label: 'Arsip Rekonsiliasi', icon: FileStack },
      { href: '/archives/classification', label: 'Arsip Klasifikasi', icon: BrainCircuit },
    ],
  },
  { href: '/settings', label: 'Pengaturan Model', icon: Settings, permission: 'edit_model_config' },
  { href: '/users', label: 'Kelola User', icon: Users, permission: 'manage_users' },
  { href: '/logs', label: 'Log Aktivitas', icon: ScrollText, permission: 'view_logs' },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [arsipOpen, setArsipOpen] = useState(pathname.startsWith('/archives'));

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  const visibleItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(user.role, item.permission);
  });

  return (
    <aside className="fixed left-0 top-0 h-screen w-65 bg-white border-r border-gray-200 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Wheat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">SimpubesSRG</h1>
            <p className="text-xs text-gray-500">Monitoring Pupuk Subsidi</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800 truncate">{user.nama}</p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
        <span
          className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}
        >
          {ROLE_LABELS[user.role]}
        </span>
        {user.kecamatan && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Kec. {user.kecamatan}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          // Dropdown Arsip
          if (item.children) {
            const isChildActive = item.children.some((c) => pathname === c.href);
            return (
              <div key={item.href}>
                <button
                  onClick={() => setArsipOpen(!arsipOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    isChildActive
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${isChildActive ? 'text-green-600' : ''}`} />
                    <span>{item.label}</span>
                  </div>
                  {arsipOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {arsipOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href;
                      const ChildIcon = child.icon;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                            isActive
                              ? 'bg-green-50 text-green-700 font-semibold border-l-4 border-green-600'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                          }`}
                        >
                          <ChildIcon className={`w-4 h-4 ${isActive ? 'text-green-600' : ''}`} />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Normal item
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-green-50 text-green-700 font-semibold border-l-4 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <Link
          href="/change-password"
          className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
        >
          <KeyRound className="w-4 h-4" />
          Ganti Password
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
