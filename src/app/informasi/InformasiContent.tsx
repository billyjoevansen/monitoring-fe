'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { type EmblaCarouselType } from 'embla-carousel';
import {
  getPerKecamatanStats,
  getGlobalStats,
  type PerKecamatanData,
  type GlobalStatsData,
} from '@/lib/api';
import Image from 'next/image';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { AlertCircle, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

/* ── Helpers ── */
function sumDitebus(p: PerKecamatanData['reconciliation']['distribusi_pupuk']): number {
  return Object.values(p).reduce((acc, v) => acc + (v?.ditebus_kg ?? 0), 0);
}

function formatKg(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} ton`;
  return `${Math.round(kg)} kg`;
}

/* ── Narasi statis per kecamatan ── */
const NARASI_BASE: Record<string, string> = {
  'Cipocok Jaya':
    'Kombinasi tanaman pangan dan hortikultura di 8 kelurahan dengan komoditas utama padi, jagung, dan cabai. Areal irigasi teknis mendukung produktivitas petani.',
  Curug:
    'Sentra produksi padi dan jagung dengan dominasi tanaman pangan di 10 kelurahan. Sistem irigasi teknis dan semi-teknis mendukung penyaluran pupuk secara merata.',
  Kasemen:
    'Sentra tanaman pangan dengan komoditas utama padi. 11 kelurahan menjadi basis produksi pertanian dengan luas lahan sawah yang signifikan.',
  Serang:
    'Kombinasi tanaman pangan dan cabai sebagai komoditas unggulan. Proporsi hortikultura tertinggi di Kota Serang dengan lahan pertanian terintegrasi kawasan permukiman.',
  Taktakan:
    'Diversifikasi komoditas paling seimbang antara tanaman pangan dan hortikultura. 12 kelurahan dengan profil lahan bervariasi.',
  Walantaka:
    'Proporsi tanaman pangan tertinggi. Mayoritas lahan sawah irigasi teknis untuk produksi padi di 6 kelurahan utama.',
};

/* ── Generate narasi dinamis dari data ── */
function generateNarasi(k: PerKecamatanData, realisasi: number, tepat: number): string {
  const nama = k.kecamatan.replace('Kecamatan ', '');
  const petani = k.reconciliation.total_petani.toLocaleString('id-ID');
  const realisasiFmt = formatKg(realisasi);
  const base = NARASI_BASE[nama] ?? '';

  const intro = `Kecamatan ${nama} memiliki ${petani} petani dalam RDKK dengan total realisasi ${realisasiFmt} pupuk bersubsidi.`;

  let ketepatan: string;
  if (tepat >= 80) {
    ketepatan = `Ketepatan data rekonsiliasi mencapai ${tepat}%, menunjukkan kualitas verifikasi yang baik antara dokumen RDKK dan hasil verval Si-Verval.`;
  } else if (tepat >= 50) {
    ketepatan = `Ketepatan data rekonsiliasi sebesar ${tepat}%, masih perlu peningkatan verifikasi antara dokumen RDKK dan hasil verval Si-Verval.`;
  } else {
    ketepatan = `Ketepatan data rekonsiliasi hanya ${tepat}%, perlu perhatian serius dalam verifikasi dokumen RDKK dan hasil verval Si-Verval.`;
  }

  return `${intro} ${ketepatan} ${base}`;
}

/* ── Framer Motion Variants ── */

/**
 * Container variants: mengatur staggerChildren untuk efek bertahap
 * staggerChildren: 0.1 = delay 100ms antar child
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

/**
 * Item variants: animasi fade-in + slide-up untuk setiap elemen child
 * hidden → visible: opacity 0→1, translateY 60px→0
 */
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

/**
 * Section header variants: animasi untuk label section (misal "Per Kecamatan")
 */
const headerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/* ── Kecamatan Card ── */
function KecamatanCard({ k }: { k: PerKecamatanData }) {
  const realisasi = sumDitebus(k.reconciliation.distribusi_pupuk);
  const tepat = k.reconciliation.persentase_lengkap;
  const nama = k.kecamatan.replace('Kecamatan ', '');

  return (
    <div className="group rounded-2xl bg-white/4 border border-white/8 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-start sm:gap-6 transition-all duration-300 hover:bg-white/7 hover:border-white/12 hover:shadow-xl hover:shadow-black/30 hover:scale-[1.02]">
      <h3 className="text-xl font-semibold tracking-wide text-white mb-3 sm:mb-0 sm:w-1/4 shrink-0">
        {nama}
      </h3>
      <div className="sm:w-3/4">
        {k.data_terbatas ? (
          <p className="text-base text-white/50 py-4">Data belum tersedia</p>
        ) : (
          <p className="text-base leading-relaxed text-white/80">
            {generateNarasi(k, realisasi, tepat)}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton Components ── */
function SkeletonCard() {
  return (
    <div className="flex-[0_0_70%] min-w-0 pl-4 first:pl-0 rounded-2xl bg-white/4 border border-white/8 p-5 sm:p-8 animate-pulse">
      <div className="h-6 w-24 bg-white/10 rounded mb-5" />
      <div className="h-4 w-full bg-white/10 rounded mb-2" />
      <div className="h-4 w-3/4 bg-white/10 rounded" />
    </div>
  );
}

function SkeletonCarousel() {
  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <div className="h-7 w-48 bg-white/10 rounded mb-8 animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="mt-10 flex items-baseline flex-wrap gap-x-6 gap-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-baseline gap-2">
          <div className="h-10 w-16 bg-white/10 rounded" />
          <div className="h-4 w-20 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}

function ErrorInline({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 mb-6">
      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
      <span className="text-sm text-red-400">{message}</span>
    </div>
  );
}

function PullIndicator({
  pullDistance,
  isRefreshing,
}: {
  pullDistance: number;
  isRefreshing: boolean;
}) {
  if (pullDistance <= 0 && !isRefreshing) return null;
  return (
    <div className="fixed top-16 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div
        className={`rounded-full bg-white/10 p-2 ${isRefreshing ? 'animate-spin' : ''}`}
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        <svg
          className="w-5 h-5 text-[#8ab894]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
      </div>
    </div>
  );
}

/* ── Carousel Section with whileInView animation ── */
function CarouselSection({ data }: { data: PerKecamatanData[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: false, align: 'center', slidesToScroll: 1 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })],
  );
  const [activePage, setActivePage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onScroll = useCallback((api: EmblaCarouselType | undefined) => {
    if (!api) return;
    setActivePage(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    setTotalPages(emblaApi.scrollSnapList().length);
    setActivePage(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    emblaApi.on('select', onScroll);
    emblaApi.on('reInit', onScroll);
    return () => {
      emblaApi.off('select', onScroll);
      emblaApi.off('reInit', onScroll);
    };
  }, [emblaApi, onScroll]);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/*
        Section header dengan whileInView animation
        once: false → animasi berulang saat scroll naik/turun
      */}
      <motion.p
        className="text-lg font-semibold tracking-[0.35em] uppercase text-[#6b8f71] mb-8"
        variants={headerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: '-50px' }}
      >
        Cakupan Kecamatan
      </motion.p>

      <div className="relative">
        {/*
          Carousel container dengan whileInView animation
          staggerChildren tidak berlaku untuk Embla slides,
          jadi kita animasi seluruh container sekaligus
        */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex">
              {data.map((k, i) => (
                <div key={k.kecamatan} className="flex-[0_0_70%] min-w-0 pl-4 first:pl-0">
                  <KecamatanCard k={k} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {canScrollPrev && (
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-30 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-md hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
        )}

        {canScrollNext && (
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-30 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-md hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Selanjutnya"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {totalPages > 0 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                activePage === i ? 'w-6 h-2 bg-[#8ab894]' : 'w-2 h-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Hero Section with Scroll Animation ── */
function HeroScrollAnimation() {
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // scrollYProgress 0 → 1: hero top at viewport top → hero bottom at viewport top
  // Text fades out in first 20% (hero masih pinned, curtain mulai naik)
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.2], [0, -80]);
  // BG parallax agresif: hero bg naik 250px selama full scroll
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -250]);

  return (
    <div ref={heroRef} className="relative" style={{ height: '250vh' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 1,
        }}
      >
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/images/bg-train-day-960.webp"
              alt="Shinkansen melewati sawah dengan latar belakang pegunungan"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-r from-[#0a0a1a] via-[#0a0a1a]/80 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-[#0a0a1a] via-transparent to-transparent" />
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          />
        </motion.div>

        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-32 -right-32 w-125 h-125 rounded-full opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #6b8f71, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-48 -left-48 w-150 h-150 rounded-full opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, #7c6b8f, transparent 70%)' }}
          />
        </div>

        <motion.div
          className="absolute inset-0 flex items-center"
          style={{ opacity: textOpacity, y: textY }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 w-full">
            <p className="text-lg font-semibold tracking-[0.35em] uppercase text-[#6b8f71] mb-6">
              SIMPUBES
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[0.95] max-w-3xl">
              Monitoring Pupuk
              <br className="hidden sm:block" /> Bersubsidi
            </h1>
            <p className="mt-5 max-w-[46ch] text-white/70 text-base lg:text-xl leading-relaxed">
              Platform digital untuk memantau, merekonsiliasi, dan mengklasifikasikan data
              penyaluran pupuk bersubsidi di Kota Serang.
            </p>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <span className="text-xs text-white/30 tracking-widest uppercase">Gulir</span>
            <ChevronDown className="w-4 h-4 text-white/30" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function InformasiContent() {
  const [global, setGlobal] = useState<GlobalStatsData | null>(null);
  const [perKec, setPerKec] = useState<PerKecamatanData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [carouselError, setCarouselError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setCarouselError(null);
    setStatsError(null);
    try {
      const [globalData, kecData] = await Promise.all([getGlobalStats(), getPerKecamatanStats()]);
      setGlobal(globalData);
      setPerKec(kecData);
    } catch {
      setCarouselError('Gagal memuat data kecamatan.');
      setStatsError('Gagal memuat data statistik.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { pullDistance, isRefreshing } = usePullToRefresh(fetchData);

  const totalRealisasi = global?.pupuk?.total_ditebus_kg ?? 0;
  const totalPetani = global?.reconciliation?.total_petani ?? 0;
  const jumlahKecamatan = perKec?.length ?? 0;
  const persentaseLengkap = global?.reconciliation?.persentase_lengkap ?? 0;

  return (
    <main className="flex-1">
      {/* Pull-to-refresh indicator */}
      <PullIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />

      {/* ── Hero with Scroll Animation ── */}
      <HeroScrollAnimation />

      {/* ── Latar Belakang (curtain overlay) ── */}
      <section
        id="latar-belakang"
        className="relative bg-transparent px-4 sm:px-6 py-2"
        style={{ marginTop: '-100vh', zIndex: 20 }}
      >
        {/* Curtain edge — gradient tepi atas tirai */}
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #0a0a1a 0%, #0a0a1a 30%, transparent 100%)',
          }}
        />
        <div className="relative overflow-hidden rounded-2xl bg-white/4 border border-white/8">
          {/* Background image + gradient overlay */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/images/kantor-distan.webp"
              alt="Kantor Dinas Pertanian Kota Serang"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-t sm:bg-linear-to-r from-[#1c2233] via-[#1c2233]/80 to-transparent sm:from-transparent sm:via-[#1c2233]/80 sm:to-[#1c2233]" />
          </div>

          <div className="relative px-5 sm:px-8 md:px-12 py-12 sm:py-16 md:py-20">
            <motion.p
              className="text-center sm:text-right sm:ml-auto text-xl sm:text-2xl font-semibold tracking-[0.35em] uppercase text-black sm:text-[#8ab894] mb-6"
              variants={headerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: '-50px' }}
            >
              Latar Belakang
            </motion.p>
            <motion.p
              className="text-center sm:text-right sm:ml-auto max-w-[70ch] text-white/80 text-lg lg:text-xl leading-relaxed"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-80px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              Distribusi pupuk bersubsidi merupakan kebijakan strategis pemerintah untuk mendukung
              ketahanan pangan nasional, yang dilaksanakan berdasarkan prinsip &quot;6 Tepat&quot;
              yaitu tepat jenis, jumlah, harga, tempat, waktu, dan sasaran. Basis data alokasi
              ditetapkan melalui eRDKK, sementara realisasi penebusan dicatat via iPubers dan
              diverifikasi dalam Si-Verval oleh DKP3 Kota Serang. Namun, integrasi kedua sistem ini
              belum optimal sehingga serapan pupuk bersubsidi di Kota Serang belum mencapai target.
              Tanpa otomasi rekonsiliasi, petugas harus memverifikasi data ribuan petani secara
              manual antar spreadsheet, yang rentan terhadap kesalahan dan memperlambat proses
              monitoring. Berdasarkan permasalahan tersebut, SIMPUBES SRG dikembangkan dengan
              memanfaatkan algoritma Random Forest untuk mengolah data eRDKK dan Si-Verval menjadi
              informasi monitoring penebusan pupuk bersubsidi yang lebih terstruktur dan berbasis
              data.
            </motion.p>
            <span id="kecamatan" />
          </div>
        </div>
      </section>
      {/* ── Carousel Per Kecamatan (dinamis) ── */}
      <section id="kecamatan" className="relative z-10 bg-[#13111C]">
        {carouselError && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
            <ErrorInline message={carouselError} />
          </div>
        )}
        {perKec && perKec.length > 0 ? (
          <CarouselSection data={perKec} />
        ) : !carouselError ? (
          <SkeletonCarousel />
        ) : null}
      </section>

      {/* ── Tujuan (dinamis) ── */}
      <section id="tentang" className="relative z-10 px-4 sm:px-6 py-8">
        <div className="relative overflow-hidden rounded-2xl bg-white/4 border border-white/8">
          {/* Background image + gradient (mirrored) */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/images/bg-train-day-960.webp"
              alt="Shinkansen melewati sawah dengan latar belakang pegunungan"
              fill
              className="object-cover object-bottom"
            />
            <div className="absolute inset-0 bg-linear-to-b sm:bg-linear-to-l from-transparent via-[#0a0a1a]/80 to-[#0a0a1a]" />
          </div>

          <div className="relative px-5 sm:px-8 md:px-12 py-12 sm:py-16 md:py-20">
            <motion.p
              className="text-center sm:text-left text-xl sm:text-2xl font-semibold tracking-[0.35em] uppercase text-[#8ab894] mb-6"
              variants={headerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: '-50px' }}
            >
              Tujuan
            </motion.p>
            <motion.p
              className="max-w-[70ch] text-white/80 text-lg lg:text-xl leading-relaxed"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-80px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              Pupuk bersubsidi adalah hak setiap petani kecil. Namun dalam praktiknya,
              ketidakcocokan data antara dokumen RDKK dan hasil verifikasi lapangan sering kali
              menimbulkan selisih yang sulit dilacak. Sistem ini hadir untuk menjembatani
              kesenjangan itu, memastikan setiap kilogram pupuk yang dialokasikan benar-benar sampai
              kepada yang berhak menerima, dengan data yang transparan dan dapat diverifikasi secara
              digital.
            </motion.p>

            {/* Social proof numbers */}
            {statsError && <ErrorInline message={statsError} />}
            {global && perKec ? (
              <motion.div
                className="mt-10 flex items-baseline flex-wrap gap-x-6 gap-y-3"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-80px' }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl lg:text-4xl font-bold tabular-nums text-white">
                    {jumlahKecamatan}
                  </span>
                  <span className="text-sm text-white/50">Kecamatan</span>
                </div>
                <span className="text-white/30">·</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl lg:text-4xl font-bold tabular-nums text-white">
                    {totalPetani.toLocaleString('id-ID')}
                  </span>
                  <span className="text-sm text-white/50">Petani</span>
                </div>
                <span className="text-white/30">·</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl lg:text-4xl font-bold tabular-nums text-[#6b8f71]">
                    {formatKg(totalRealisasi)}
                  </span>
                  <span className="text-sm text-white/50">Realisasi</span>
                </div>
                <span className="text-white/30">·</span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl lg:text-4xl font-bold tabular-nums ${
                      persentaseLengkap >= 80
                        ? 'text-[#6b8f71]'
                        : persentaseLengkap >= 50
                          ? 'text-yellow-400'
                          : 'text-red-400'
                    }`}
                  >
                    {persentaseLengkap}%
                  </span>
                  <span className="text-sm text-white/50">Ketepatan</span>
                </div>
              </motion.div>
            ) : !statsError ? (
              <SkeletonStats />
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Keunggulan (statis) ── */}
      <section id="fitur" className="relative z-10 bg-[#13111C]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <motion.p
            className="text-xl sm:text-2xl font-semibold tracking-[0.35em] uppercase text-[#8ab894] mb-6"
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-50px' }}
          >
            Keunggulan
          </motion.p>

          <motion.div
            className="grid sm:grid-cols-2 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-80px' }}
          >
            <motion.div
              className="rounded-2xl bg-white/4 border border-white/8 p-5 sm:p-8 flex flex-row items-start gap-6 transition-all duration-300 hover:bg-white/7 hover:border-white/12 hover:shadow-xl hover:shadow-black/30"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold tracking-wide text-white w-1/3 shrink-0">
                Transparansi Data
              </h3>
              <p className="w-2/3 text-base leading-relaxed text-white/80">
                Setiap transaksi penebusan pupuk dapat dilacak dan diverifikasi, mulai dari tingkat
                kecamatan hingga pusat.
              </p>
            </motion.div>

            <motion.div
              className="rounded-2xl bg-white/4 border border-white/8 p-5 sm:p-8 flex flex-row items-start gap-6 transition-all duration-300 hover:bg-white/7 hover:border-white/12 hover:shadow-xl hover:shadow-black/30"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold tracking-wide text-white w-1/3 shrink-0">
                Rekonsiliasi Akurat
              </h3>
              <p className="w-2/3 text-base leading-relaxed text-white/80">
                Pencocokan otomatis antara data eRDKK dan hasil verval Si-Verval untuk memastikan
                akurasi penyaluran.
              </p>
            </motion.div>

            <motion.div
              className="rounded-2xl bg-white/4 border border-white/8 p-5 sm:p-8 flex flex-row items-start gap-6 transition-all duration-300 hover:bg-white/7 hover:border-white/12 hover:shadow-xl hover:shadow-black/30"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold tracking-wide text-white w-1/3 shrink-0">
                Klasifikasi
              </h3>
              <p className="w-2/3 text-base leading-relaxed text-white/80">
                Klasifikasi otomatis status penebusan pupuk menggunakan algoritma Random Forest
                berdasarkan data eRDKK dan Si-Verval.
              </p>
            </motion.div>

            <motion.div
              className="rounded-2xl bg-white/4 border border-white/8 p-5 sm:p-8 flex flex-row items-start gap-6 transition-all duration-300 hover:bg-white/7 hover:border-white/12 hover:shadow-xl hover:shadow-black/30"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold tracking-wide text-white w-1/3 shrink-0">
                Monitoring Periodik
              </h3>
              <p className="w-2/3 text-base leading-relaxed text-white/80">
                Pemantauan alokasi pupuk per kecamatan, jumlah petani penerima, dan realisasi
                penyaluran secara berkala sesuai periode masa tanam atau distribusi.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
