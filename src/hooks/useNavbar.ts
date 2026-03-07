import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import {
  LayoutDashboard,
  FileSearch,
  Tags,
  FlaskConical,
  BrainCog,
  Settings,
  Archive,
  FileStack,
  BrainCircuit,
  Users,
  ScrollText,
} from 'lucide-react';
import type { NavItem, User } from '@/types';

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

export function useNavbar({ user }: { user: User }) {
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
    try {
      await logout();
      sessionStorage.clear();
      router.refresh();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  return {
    visibleItems,
    isActive,
    isArsipActive,
    isTrainActive,
    mobileOpen,
    setMobileOpen,
    arsipOpen,
    setArsipOpen,
    trainOpen,
    setTrainOpen,
    profileOpen,
    setProfileOpen,
    handleLogout,
    arsipRef,
    trainRef,
    profileRef,
  };
}
