'use client';

import { useState } from 'react';
import { Wheat, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { resetPassword } from '@/lib/auth';
import Link from 'next/link';
import Turnstile from '@/components/Turnstile';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError('Gagal mengirim email reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4 shadow-lg">
            <Wheat className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Email Terkirim!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Cek inbox email <strong>{email}</strong> untuk link reset password.
              </p>
              <Link href="/login" className="text-green-600 hover:underline font-medium">
                Kembali ke halaman login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6">
                Masukkan email yang terdaftar. Kami akan mengirim link untuk reset password.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <Turnstile
                  onVerify={(token) => console.log('Turnstile token:', token)}
                  onExpire={() => console.log('Turnstile expired')}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    'Kirim Link Reset'
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-4">
            <Link
              href="/login"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
