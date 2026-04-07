'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const [completing, setCompleting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

  const startProgress = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setVisible(true);
    setCompleting(false);
    setWidth(8);

    let w = 8;
    timerRef.current = setInterval(() => {
      // Easing: fast at first, slows near 85%
      const increment = Math.random() * 12 * Math.pow(1 - w / 90, 1.5);
      w = Math.min(w + increment, 85);
      setWidth(w);
      if (w >= 85 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 180);
  };

  const completeProgress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCompleting(true);
    setWidth(100);
    startedRef.current = false;

    setTimeout(() => {
      setVisible(false);
      setWidth(0);
      setCompleting(false);
    }, 420);
  };

  // Intercept anchor clicks to start the bar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip external, hash-only, mailto, tel links and blank targets
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto') ||
        href.startsWith('tel') ||
        anchor.target === '_blank' ||
        anchor.getAttribute('download') != null
      ) return;

      // Don't trigger for same page
      const currentPath = window.location.pathname;
      const targetPath = href.split('?')[0].split('#')[0];
      if (targetPath && targetPath !== currentPath) {
        startProgress();
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  // Complete bar when route actually changes
  useEffect(() => {
    if (startedRef.current || visible) {
      completeProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <>
      {/* Main progress bar */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2.5px',
          zIndex: 99999,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${width}%`,
            background: 'linear-gradient(90deg, #16a34a, #22c55e, #4ade80)',
            transition: completing
              ? 'width 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.15s ease 0.25s'
              : 'width 0.18s ease-out',
            borderRadius: '0 9999px 9999px 0',
            boxShadow: '0 0 10px 1px rgba(34,197,94,0.55)',
            opacity: completing && width === 100 ? 0 : 1,
          }}
        />
        {/* Sheen */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '80px',
            height: '100%',
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            animation: 'progress-sheen 1.2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Subtle page dimming */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99998,
          pointerEvents: 'none',
          background: 'rgba(0,0,0,0.03)',
          opacity: completing ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      />

      <style>{`
        @keyframes progress-sheen {
          0% { transform: translateX(-100px); opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateX(80px); opacity: 0; }
        }
      `}</style>
    </>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
