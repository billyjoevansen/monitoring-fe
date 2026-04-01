import type { Role, Permission } from '@/types';

// Matriks permission per role.
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'view_reconciliation',
    'view_classification',
    'view_training',
    'upload_files',
    'train_model',
    'edit_model_config',
    'manage_users',
    'view_logs',
    'manage_archives',
    'view_archives',
    'view_api',
    'view_dashboard',
  ],
  kabid: [
    'view_reconciliation',
    'view_classification',
    'view_training',
    'train_model',
    'manage_users',
    'view_logs',
    'manage_archives',
    'view_archives',
    'view_dashboard',
  ],
  kasie: [
    'view_reconciliation',
    'view_classification',
    'view_training',
    'upload_files',
    'train_model',
    'view_logs',
    'view_archives',
    'view_dashboard',
  ],
  bpp: ['view_dashboard', 'view_reconciliation', 'upload_files', 'view_archives'],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getCreatableRoles(role: Role): Role[] {
  switch (role) {
    case 'admin':
      return ['admin', 'kabid', 'kasie', 'bpp'];
    case 'kabid':
      return ['kasie', 'bpp'];
    case 'kasie':
      return ['bpp'];
    default:
      return [];
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  kabid: 'Kepala Bidang',
  kasie: 'Kepala Seksi Penyuluh',
  bpp: 'BPP',
};

export const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-red-100 text-red-700',
  kabid: 'bg-blue-100 text-blue-700',
  kasie: 'bg-purple-100 text-purple-700',
  bpp: 'bg-green-100 text-green-700',
};

export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/reconcile': 'upload_files',
  '/classify': 'view_classification',
  '/training': 'view_training',
  '/settings': 'edit_model_config',
  '/users': 'manage_users',
  '/logs': 'view_logs',
  '/archives/reconciliation': 'view_archives',
  '/archives/classification': 'view_archives',
};
