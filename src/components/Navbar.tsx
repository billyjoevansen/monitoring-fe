'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileSearch,
  BrainCircuit,
  BrainCog,
  FlaskConical,
  Settings,
  Users,
  ScrollText,
  Wheat,
  LogOut,
  KeyRound,
  Archive,
  ChevronDown,
  FileStack,
  Tags,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';
import { hasPermission, ROLE_LABELS, ROLE_COLORS } from '@/lib/rbac';
import { logout } from '@/lib/auth';
import type { User } from '@/types';
import type { Permission } from '@/types';

interface NavbarProps {
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
    href: '#training',
    label: 'Training',
    icon: FlaskConical,
    permission: 'view_training',
    children: [
      { href: '/training', label: 'Training', icon: BrainCog },
      { href: '/settings', label: 'Pengaturan', icon: Settings },
    ],
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
  { href: '/users', label: 'Users', icon: Users, permission: 'manage_users' },
  { href: '/logs', label: 'Log', icon: ScrollText, permission: 'view_logs' },
];

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [arsipOpen, setArsipOpen] = useState(false);
  const [trainOpen, setTrainOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const arsipRef = useRef<HTMLDivElement>(null);
  const trainRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (arsipRef.current && !arsipRef.current.contains(e.target as Node)) setArsipOpen(false);
      if (trainRef.current && !trainRef.current.contains(e.target as Node)) setTrainOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setArsipOpen(false);
    setTrainOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  const visibleItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(user.role, item.permission);
  });

  const isActive = (href: string) => pathname === href;
  const isArsipActive = navItems
    .find((i) => i.href === '#arsip')
    ?.children?.some((c) => pathname === c.href);
  const isTrainActive = navItems
    .find((i) => i.href === '#training')
    ?.children?.some((c) => pathname === c.href);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl supports-backdrop-filter:bg-white/60">
        <div className="max-w-400 mx-auto px-4 sm:px-6 outline-2 outline-black">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 bg-linear-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center shadow-sm">
                <Wheat className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-base font-bold text-gray-900 tracking-tight hidden sm:block">
                SimpubesSRG
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {visibleItems.map((item) => {
                if (item.children) {
                  const isTrainingItem = item.href === '#training';
                  const dropdownRef = isTrainingItem ? trainRef : arsipRef;
                  const dropdownOpen = isTrainingItem ? trainOpen : arsipOpen;
                  const setDropdownOpen = isTrainingItem ? setTrainOpen : setArsipOpen;
                  const isDropdownActive = isTrainingItem ? isTrainActive : isArsipActive;

                  return (
                    <div key={item.href} ref={dropdownRef} className="relative">
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isDropdownActive
                            ? 'text-green-700 bg-green-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {dropdownOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                                  isActive(child.href)
                                    ? 'text-green-700 bg-green-50 font-medium'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                <ChildIcon className="w-4 h-4" />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'text-green-700 bg-green-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {/* Active underline indicator */}
                    {isActive(item.href) && (
                      <span className="absolute -bottom-3.25 left-3 right-3 h-0.5 bg-green-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right side — Profile + Mobile toggle */}
            <div className="flex items-center gap-2">
              {/* Profile Dropdown (Desktop) */}
              <div ref={profileRef} className="relative hidden lg:block">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100/80 transition-colors"
                >
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-700">
                      {user.nama?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-semibold text-gray-800 leading-tight truncate max-w-30">
                      {user.nama}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      {ROLE_LABELS[user.role]}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-60 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.nama}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <span
                        className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${ROLE_COLORS[user.role]}`}
                      >
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                    <Link
                      href="/change-password"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <KeyRound className="w-4 h-4" />
                      Ganti Password
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100/80 transition-colors"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 space-y-1">
              {/* User info mobile */}
              <div className="px-3 py-3 mb-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-800">{user.nama}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${ROLE_COLORS[user.role]}`}
                >
                  {ROLE_LABELS[user.role]}
                </span>
              </div>

              {/* Navigasi Mobile */}
              {visibleItems.map((item) => {
                if (item.children) {
                  const isTrainingItem = item.href === '#training';
                  const dropdownOpen = isTrainingItem ? trainOpen : arsipOpen;
                  const dropdownRef = isTrainingItem ? trainRef : arsipRef;
                  const setDropdownOpen = isTrainingItem ? setTrainOpen : setArsipOpen;
                  const isDropdownActive = isTrainingItem ? isTrainActive : isArsipActive;

                  return (
                    <div key={item.href} ref={dropdownRef}>
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                          isDropdownActive ? 'text-green-700 bg-green-50' : 'text-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {dropdownOpen && (
                        <div className="ml-6 mt-1 space-y-0.5">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                                  isActive(child.href)
                                    ? 'text-green-700 bg-green-50 font-medium'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                              >
                                <ChildIcon className="w-4 h-4" />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive(item.href)
                        ? 'text-green-700 bg-green-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                <Link
                  href="/change-password"
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <KeyRound className="w-4 h-4" />
                  Ganti Password
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
