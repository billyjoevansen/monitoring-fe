'use client';

import { useState } from 'react';
import { UserX, LogOut, Phone } from 'lucide-react';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DeactivatedPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Image
              src="/Logo_Kota_Serang.webp"
              alt="Logo SimpubesSRG"
              width={100}
              height={100}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">SIMPUBES SERANG</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <UserX className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">Akun Dinonaktifkan</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Akun Anda telah dinonaktifkan oleh administrator. Silakan hubungi admin untuk informasi
            lebih lanjut atau mengaktifkan kembali akun Anda.
          </p>

          <div className="space-y-3">
            {/* Hubungi Atmin */}
            <a
              href="https://wa.me/XXXXXXXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Hubungi Admin
            </a>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {loading ? 'Sedang Logout...' : 'Log Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
