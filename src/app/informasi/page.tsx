import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, FileSearch, Tags, Package } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Informasi Publik',
  description: 'Informasi statistik monitoring pupuk bersubsidi Kota Serang.',
};

export default function InformasiPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-foreground/10 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-3 group">
            <Image
              src="/Logo_Kota_Serang.webp"
              alt="Logo Kota Serang"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="text-sm font-bold tracking-wide text-foreground hidden sm:inline">
              SIMPUBES SERANG
            </span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16 w-full">
        <div className="text-center mb-12 sm:mb-16">
          <div className="border-y-2 py-2 mb-4 border-foreground/20 bg-linear-to-r from-black/5 via-black/30 to-black/5 dark:bg-linear-to-r dark:from-white/5 dark:via-white/30 dark:to-white/5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-foreground">
              INFORMASI PUBLIK
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Statistik dan informasi monitoring pupuk bersubsidi Kota Serang
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          <div className="rounded-lg border border-green-500/20 p-6 text-center bg-green-50/40 dark:bg-green-950/10 hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <FileSearch className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Rekonsiliasi</h3>
            <p className="text-sm text-muted-foreground">Data rekonsiliasi RDKK & Si-Verval</p>
          </div>

          <div className="rounded-lg border border-green-500/20 p-6 text-center bg-green-50/40 dark:bg-green-950/10 hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <Tags className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Klasifikasi</h3>
            <p className="text-sm text-muted-foreground">Data klasifikasi petani</p>
          </div>

          <div className="rounded-lg border border-green-500/20 p-6 text-center bg-green-50/40 dark:bg-green-950/10 hover:shadow-sm transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Pupuk</h3>
            <p className="text-sm text-muted-foreground">Distribusi pupuk per kecamatan</p>
          </div>
        </div>

        <div className="rounded-lg border-2 border-dashed border-green-500/20 p-12 text-center bg-green-50/20 dark:bg-green-950/5">
          <p className="text-muted-foreground text-sm">Konten statistik akan ditambahkan</p>
        </div>
      </main>

      <footer className="border-t border-foreground/10 bg-green-950/5 dark:bg-green-950/10">
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
                <p className="text-sm font-semibold text-foreground">Dinas Pertanian Kota Serang</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sistem Informasi Monitoring Pupuk Bersubsidi
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right text-xs text-muted-foreground">
              <p>Jl. Jend. Sudirman No.15, Panancangan, Kec. Serang</p>
              <p>Kota Serang, Banten 42124</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-foreground/10 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SimpubesSRG
          </div>
        </div>
      </footer>
    </div>
  );
}
