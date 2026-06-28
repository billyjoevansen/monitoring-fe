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
  FileUp,
  FileSpreadsheet,
  Table2,
} from 'lucide-react';
import type { NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
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
  {
    href: '#arsip-dokumen',
    label: 'Dokumen',
    icon: FileUp,
    permission: 'view_documents',
    children: [
      { href: '/archives/rdkk', label: 'Dokumen RDKK', icon: FileSpreadsheet },
      { href: '/archives/siverval', label: 'Dokumen Si-Verval', icon: Table2 },
    ],
  },
  { href: '/users', label: 'Users', icon: Users, permission: 'manage_users' },
  { href: '/logs', label: 'Log', icon: ScrollText, permission: 'view_logs' },
];
