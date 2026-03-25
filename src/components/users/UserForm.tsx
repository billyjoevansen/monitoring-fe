import { CheckCircle, Loader2, X } from 'lucide-react';
import type { Role, Kecamatan } from '@/types';
import { ROLE_LABELS } from '@/config/rbac';
import type { UserFormState } from '@/hooks/useUsers';

interface UserFormProps {
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
  return (
    <div className="bg-background rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">
          {isEditing ? 'Edit User' : 'Tambah User Baru'}
        </h2>
        <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full">
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {error && (
        <div className="bg-background border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => onFormChange({ nama: e.target.value })}
              required
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-background disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => onFormChange({ role: e.target.value as Role })}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
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
              <label className="block text-sm font-medium text-foreground mb-1">Kecamatan</label>
              <select
                value={form.kecamatan}
                onChange={(e) => onFormChange({ kecamatan: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => onFormChange({ password: e.target.value })}
                required
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            Batal
          </button>
          <button
            type="submit"
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
      </form>
    </div>
  );
}
