'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  Pencil,
  CheckCircle,
  X,
  UserPlus,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { createClient } from '@/lib/supabase/client';
import { getCreatableRoles, ROLE_LABELS, ROLE_COLORS } from '@/lib/rbac';
import { logActivity } from '@/lib/auth';
import type { User, Role, Kecamatan } from '@/types';

export default function UsersPage() {
  const currentUser = useUser();
  const creatableRoles = getCreatableRoles(currentUser.role);

  const [users, setUsers] = useState<User[]>([]);
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formEmail, setFormEmail] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formRole, setFormRole] = useState<Role>('bpp');
  const [formKecamatan, setFormKecamatan] = useState('');
  const [formPassword, setFormPassword] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();

    const [usersRes, kecRes] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('kecamatan').select('*').order('nama'),
    ]);

    if (usersRes.data) {
      let filtered = usersRes.data as User[];
      if (currentUser.role === 'kabid') {
        filtered = filtered.filter(
          (u) => u.role === 'kasie' || u.role === 'bpp' || u.id === currentUser.id,
        );
      }
      setUsers(filtered);
    }

    if (kecRes.data) setKecamatanList(kecRes.data as Kecamatan[]);
    setLoading(false);
  };

  const resetForm = () => {
    setFormEmail('');
    setFormNama('');
    setFormRole('bpp');
    setFormKecamatan('');
    setFormPassword('');
    setEditingUser(null);
    setShowForm(false);
    setError(null);
  };

  const openEditForm = (user: User) => {
    setEditingUser(user);
    setFormEmail(user.email);
    setFormNama(user.nama);
    setFormRole(user.role);
    setFormKecamatan(user.kecamatan || '');
    setFormPassword('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();

    try {
      if (editingUser) {
        // UPDATE
        const updateData: Partial<User> = {
          nama: formNama,
          role: formRole,
          kecamatan: formRole === 'bpp' ? formKecamatan : null,
        };

        const { error: updateErr } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editingUser.id);

        if (updateErr) throw updateErr;

        await logActivity('update_user', `Mengubah user ${formNama} (${formRole})`);
        setSuccess(`User ${formNama} berhasil diperbarui.`);
      } else {
        // CREATE
        if (!formPassword || formPassword.length < 8) {
          setError('Password minimal 8 karakter.');
          setSaving(false);
          return;
        }

        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: formEmail,
          password: formPassword,
          options: {
            data: { nama: formNama },
          },
        });

        if (authErr) throw authErr;
        if (!authData.user) throw new Error('Gagal membuat akun.');

        const { error: insertErr } = await supabase.from('users').insert({
          id: authData.user.id,
          email: formEmail,
          nama: formNama,
          role: formRole,
          kecamatan: formRole === 'bpp' ? formKecamatan : null,
        });

        if (insertErr) throw insertErr;

        await logActivity('create_user', `Membuat user ${formNama} (${formRole})`);
        setSuccess(`User ${formNama} berhasil dibuat.`);
      }

      resetForm();
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    const supabase = createClient();
    const newStatus = !user.is_active;

    const { error: toggleErr } = await supabase
      .from('users')
      .update({ is_active: newStatus })
      .eq('id', user.id);

    if (!toggleErr) {
      await logActivity(
        newStatus ? 'activate_user' : 'deactivate_user',
        `${newStatus ? 'Mengaktifkan' : 'Menonaktifkan'} user ${user.nama}`,
      );
      await loadData();
      setSuccess(`User ${user.nama} ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">👥 Kelola User</h1>
          <p className="text-gray-500 mt-1">Tambah dan kelola akun pengguna</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <UserPlus className="w-4 h-4" />
          Tambah User
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {editingUser ? 'Edit User' : 'Tambah User Baru'}
            </h2>
            <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  disabled={!!editingUser}
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {creatableRoles.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kecamatan (BPP Daerah) */}
              {formRole === 'bpp' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                  <select
                    value={formKecamatan}
                    onChange={(e) => setFormKecamatan(e.target.value)}
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

              {/* Password (hanya untuk create) */}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
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
                onClick={resetForm}
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
                {editingUser ? 'Simpan Perubahan' : 'Buat User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Kecamatan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u, idx) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{u.nama}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}
                    >
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.kecamatan || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== currentUser.id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditForm(u)}
                          title="Edit"
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          title={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          className="p-1.5 hover:bg-yellow-50 rounded-lg transition-colors"
                        >
                          {u.is_active ? (
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                          ) : (
                            <ShieldOff className="w-4 h-4 text-yellow-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          title={u.is_active ? '' : 'Hapus?'}
                          className={
                            u.is_active
                              ? 'hidden'
                              : 'p-1.5 hover:bg-red-50 rounded-lg transition-colors'
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Belum ada user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
