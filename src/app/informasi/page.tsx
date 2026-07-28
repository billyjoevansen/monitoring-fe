import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import InformasiContent from './InformasiContent';

export const metadata: Metadata = {
  title: 'Informasi Publik',
  description: 'Informasi statistik monitoring pupuk bersubsidi Kota Serang.',
};

export default function InformasiPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col dark">
      <header className="sticky top-0 z-40 bg-[#0a0a1a]/95 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-3 group">
            <Image
              src="/Logo_Kota_Serang.webp"
              alt="Logo Kota Serang"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="text-sm font-bold tracking-wide text-white hidden sm:inline">
              SIMPUBES SERANG
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#latar-belakang" className="text-sm text-white/70 hover:text-white transition-colors">Latar Belakang</a>
            <a href="#kecamatan" className="text-sm text-white/70 hover:text-white transition-colors">Cakupan</a>
            <a href="#tentang" className="text-sm text-white/70 hover:text-white transition-colors">Tujuan</a>
            <a href="#fitur" className="text-sm text-white/70 hover:text-white transition-colors">Fitur</a>
          </nav>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
      </header>

      <InformasiContent />

      <footer className="relative z-40 border-t border-white/[0.06] bg-[#0a0a1a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Image
                src="/Logo_Kota_Serang.webp"
                alt="Logo Kota Serang"
                width={48}
                height={48}
                className="object-contain"
              />
              <div>
                <p className="text-sm font-semibold text-white">Dinas Pertanian Kota Serang</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Sistem Informasi Monitoring Pupuk Bersubsidi
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right text-xs text-white/40">
              <p>Jl. Jend. Sudirman No.15, Panancangan, Kec. Serang</p>
              <p>Kota Serang, Banten 42124</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-white/40">
            &copy; {new Date().getFullYear()} SimpubesSRG
          </div>
        </div>
      </footer>
    </div>
  );
}
