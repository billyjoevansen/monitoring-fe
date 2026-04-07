'use client';

import { useEffect, useState } from 'react';

interface RouteChangeOverlayProps {
  visible: boolean;
  message?: string;
}

export function RouteChangeOverlay({
  visible,
  message = 'Memuat...',
}: RouteChangeOverlayProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      // Slight delay so the overlay doesn't flash on fast transitions
      const t = setTimeout(() => setShow(true), 60);
      return () => clearTimeout(t);
    } else {
      setShow(false);
    }
  }, [visible]);

  if (!visible && !show) return null;

  return (
    <div
      aria-live="polite"
      aria-label={message}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        opacity: show ? 1 : 0,
        transition: 'opacity 0.22s ease',
        pointerEvents: show ? 'all' : 'none',
      }}
      className="dark:!bg-slate-950/80"
    >
      {/* Spinner */}
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        {/* Outer ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#16a34a',
            borderRightColor: '#22c55e',
            animation: 'overlay-spin 0.75s linear infinite',
          }}
        />
        {/* Inner dot */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#22c55e',
            animation: 'overlay-pulse 0.75s ease-in-out infinite',
          }}
        />
      </div>

      {/* Message */}
      <p
        style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#374151',
          letterSpacing: '0.01em',
        }}
        className="dark:!text-slate-300"
      >
        {message}
      </p>

      <style>{`
        @keyframes overlay-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes overlay-pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 0.5; transform: translate(-50%, -50%) scale(0.7); }
        }
      `}</style>
    </div>
  );
}
