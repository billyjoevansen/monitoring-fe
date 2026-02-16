'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle, KeyRound, XCircle } from 'lucide-react';
import { updatePassword, logActivity } from '@/lib/auth';

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi tidak sama.');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(newPassword);
      await logActivity('change_password', 'User mengganti password');
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError('Gagal mengganti password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid items-center justify-center">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Ganti Password</h1>
          <p className="text-gray-500 mt-1">Ubah password akun kamu</p>
        </div>
      </div>

      <div className="max-w-md">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Password berhasil diubah!
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password Baru
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Strength */}
            {newPassword && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">Kekuatan Password:</p>
                <div className="flex gap-1">
                  <div
                    className={`h-1.5 flex-1 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}
                  />
                  <div
                    className={`h-1.5 flex-1 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}
                  />
                  <div
                    className={`h-1.5 flex-1 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}
                  />
                  <div
                    className={`h-1.5 flex-1 rounded-full ${/[!@#$%^&*]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}
                  />
                </div>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                    8+ karakter
                  </span>
                  <span className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                    Huruf besar
                  </span>
                  <span className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>Angka</span>
                  <span className={/[!@#$%^&*]/.test(newPassword) ? 'text-green-600' : ''}>
                    Simbol
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Ganti Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
