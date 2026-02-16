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
  ],
  kabid: [
    'view_reconciliation',
    'view_classification',
    'view_training',
    'train_model',
    'manage_users',
    'view_logs',
    'manage_archives',
  ],
  kasie: [
    'view_reconciliation',
    'view_classification',
    'view_training',
    'upload_files',
    'train_model',
    'view_logs',
  ],
  bpp: ['view_reconciliation', 'view_classification', 'upload_files'],
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
    default:
      return [];
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  kabid: 'Kepala Bidang',
  kasie: 'Kepala Seksi Penyuluh',
  bpp: 'Balai Penyuluh Pertanian',
};

export const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-red-100 text-red-700',
  kabid: 'bg-blue-100 text-blue-700',
  kasie: 'bg-purple-100 text-purple-700',
  bpp: 'bg-green-100 text-green-700',
};
