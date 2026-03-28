import { CheckCircle, Loader2, X } from 'lucide-react';
import { useEffect } from 'react';
import type { Role, Kecamatan } from '@/types';
import { ROLE_LABELS } from '@/config/rbac';
import type { UserFormState } from '@/hooks/useUsers';

interface UserFormProps {
  open: boolean;
  isEditing: boolean;
  form: UserFormState;
  onFormChange: (updated: Partial<UserFormState>) => void;
  creatableRoles: Role[];
  kecamatanList: Kecamatan[];
  saving: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function UserForm({
  open,
  isEditing,
  form,
  onFormChange,
  creatableRoles,
  kecamatanList,
  saving,
  error,
  onSubmit,
  onCancel,
}: UserFormProps) {
  // Tutup modal saat tekan Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  // Nonaktifkan scroll body saat modal terbuka
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="user-form-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Panel Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="user-form-title" className="text-lg font-bold text-foreground">
            {isEditing ? 'Edit User' : 'Tambah User Baru'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form id="user-form" onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => onFormChange({ nama: e.target.value })}
                  required
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onFormChange({ email: e.target.value })}
                  required
                  disabled={isEditing}
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => onFormChange({ role: e.target.value as Role })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {creatableRoles.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>

              {form.role === 'bpp' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Kecamatan
                  </label>
                  <select
                    value={form.kecamatan}
                    onChange={(e) => onFormChange({ kecamatan: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Pilih Kecamatan</option>
                    {kecamatanList.map((kec) => (
                      <option key={kec.id} value={kec.nama}>
                        {kec.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!isEditing && (
                <div className={form.role === 'bpp' ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => onFormChange({ password: e.target.value })}
                    required
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium text-sm"
          >
            Batal
          </button>
          <button
            type="submit"
            form="user-form"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isEditing ? 'Simpan Perubahan' : 'Buat User'}
          </button>
        </div>
      </div>
    </div>
  );
}
