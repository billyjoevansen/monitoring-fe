'use client';
import Image from 'next/image';
import { SLIDES, FADE_DURATION, SLIDE_DURATION } from '@/config/slides';
import { useSlider } from '@/hooks/useSlider';

export default function SlidePanel() {
  const { current } = useSlider(SLIDES.length, SLIDE_DURATION);

  return (
    <div className="hidden md:flex md:w-[55%] flex-col items-center justify-center relative overflow-hidden bg-gray-900">
      {/* Slides */}
      {SLIDES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0"
          style={{
            opacity: i === current ? 1 : 0,
            transition: `opacity ${FADE_DURATION}ms ease-in-out`,
            zIndex: i === current ? 1 : 0,
          }}
        >
          <Image
            src={src}
            alt={`Slide ${i + 1}`}
            fill
            sizes="55vw"
            className="object-cover object-center"
            priority={i === 0}
            quality={85}
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* Dot indicators */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className="block rounded-full transition-all duration-500"
            style={{
              width: i === current ? '22px' : '6px',
              height: '6px',
              backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.35)',
            }}
          />
        ))}
      </div>

      {/* Branding */}
      <div className="relative z-20 text-center pb-40 px-12 max-w-lg">
        <div className="border-b border-white/40 pb-3 mb-4">
          <p className="text-white/80 text-base font-semibold tracking-[0.25em] uppercase">
            Selamat Datang
          </p>
        </div>
        <h1 className="text-5xl font-black text-white tracking-widest uppercase mb-3 leading-tight drop-shadow-lg">
          SIMPUBES SRG
        </h1>
        <p className="text-white/70 text-xs tracking-widest uppercase">
          Sistem Informasi Monitoring Pupuk Bersubsidi Kota Serang
        </p>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-white/40 text-xs tracking-widest z-20">
        © {new Date().getFullYear()} SimpubesSRG — Dinas Pertanian Kota Serang
      </p>
    </div>
  );
}
