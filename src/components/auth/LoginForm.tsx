'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { login } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-[45%] flex items-center justify-center px-10 py-12 bg-background transition-colors duration-200">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8">
          <div className="border-y-2 pb-2 mb-6 border-foreground/20 text-center">
            <h2 className="text-2xl font-bold tracking-wide text-foreground">Log In</h2>
          </div>
          <div className="flex justify-center mb-8">
            <Image
              src="/Logo_Kota_Serang.webp"
              alt="Logo SimpubesSRG"
              width={100}
              height={100}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm p-3 rounded mb-4 border bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukan alamat email"
              required
              className="w-full px-3 py-2.5 rounded text-sm border bg-background text-foreground border-gray-300 dark:border-gray-600 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent transition-colors duration-200"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1 text-muted-foreground"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukan Password"
                required
                className="w-full px-3 py-2.5 pr-10 rounded text-sm border bg-background text-foreground border-gray-300 dark:border-gray-600 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 rounded font-semibold text-sm flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        {/* Forgot password */}
        <div className="mt-4">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
          >
            Lupa Password?
          </Link>
        </div>
      </div>
    </div>
  );
}
