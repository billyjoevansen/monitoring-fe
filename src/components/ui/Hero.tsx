import React, { useId, useState, useEffect } from 'react';

// ─── Pattern Definitions ──────────────────────────────────────────────────────
// Each entry: [light backgroundImage, dark backgroundImage, backgroundSize]
const PATTERNS: [string, string, string][] = [
  [
    // Fine dot grid
    `radial-gradient(circle, #e5e7eb 5px, transparent 1px)`,
    `radial-gradient(circle, #1e293b 5px, transparent 1px)`,
    '20px 20px',
  ],
  [
    // Subtle cross-hatch
    `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
    `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
    '32px 32px',
  ],
  [
    // Diagonal thin lines
    `repeating-linear-gradient(135deg, #e5e7eb 0px, #e5e7eb 10px, transparent 1px, transparent 12px)`,
    `repeating-linear-gradient(135deg, #1e293b 0px, #1e293b 10px, transparent 1px, transparent 12px)`,
    '12px 12px',
  ],
  [
    // 1. Bold Polka Dots (Titik besar yang solid)
    `radial-gradient(circle, #e5e7eb 8px, transparent 8px)`,
    `radial-gradient(circle, #334155 8px, transparent 8px)`,
    '40px 40px',
  ],
  [
    // 2. Thick Diagonal Stripes (Garis miring tebal/Sporty)
    `linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 50%, #e5e7eb 50%, #e5e7eb 75%, transparent 75%, transparent)`,
    `linear-gradient(45deg, #1e293b 25%, transparent 25%, transparent 50%, #1e293b 50%, #1e293b 75%, transparent 75%, transparent)`,
    '40px 40px',
  ],
  [
    // 3. Blueprint Grid (Double line yang tegas)
    `linear-gradient(#e5e7eb 2px, transparent 2px), linear-gradient(90deg, #e5e7eb 2px, transparent 2px), linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
    `linear-gradient(#1e293b 2px, transparent 2px), linear-gradient(90deg, #1e293b 2px, transparent 2px), linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
    '80px 80px, 20px 20px',
  ],
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface HeroProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  /** Optional action buttons rendered on the right side */
  actions?: React.ReactNode;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Hero({ title, subtitle, icon, actions, className = '' }: HeroProps) {
  // Unique ID so the scoped <style> doesn't bleed into other <section> elements
  const uid = useId().replace(/:/g, '');
  const sectionId = `hero-${uid}`;

  const [pattern, setPattern] = useState<[string, string, string] | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPattern(PATTERNS[Math.floor(Math.random() * PATTERNS.length)]);
    // Trigger entrance animation after mount
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* Scoped styles — targets only THIS hero instance by ID */}
      <style>{`
        #${sectionId} {
          --hero-pattern-light: ${pattern?.[0] ?? 'none'};
          --hero-pattern-dark:  ${pattern?.[1] ?? 'none'};
          --hero-bg-size:       ${pattern?.[2] ?? '20px 20px'};
          background-image: var(--hero-pattern-light);
          background-size: var(--hero-bg-size);
        }
        .dark #${sectionId} {
          background-image: var(--hero-pattern-dark);
        }

        /* Entrance keyframes */
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-pop {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes hero-ping-once {
          0%   { transform: scale(1);   opacity: 0.6; }
          80%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        #${sectionId} .hero-icon-wrap {
          animation: ${mounted ? 'hero-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' : 'none'};
        }
        #${sectionId} .hero-text-block {
          animation: ${mounted ? 'hero-fade-up 0.45s ease both 0.07s' : 'none'};
        }
        #${sectionId} .hero-actions {
          animation: ${mounted ? 'hero-fade-up 0.45s ease both 0.15s' : 'none'};
        }
        #${sectionId} .hero-badge {
          animation: ${mounted ? 'hero-fade-up 0.4s ease both 0s' : 'none'};
        }
        #${sectionId} .hero-icon-ring {
          animation: hero-ping-once 1.4s ease-out 0.35s 1 forwards;
        }
      `}</style>

      <section
        id={sectionId}
        className={`relative mb-3 overflow-hidden border-b border-gray-200 dark:border-slate-800 transition-colors ${className}`}
      >
        {/* Subtle gradient fade at bottom to blend into page */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-white/60 dark:from-slate-950/60 to-transparent pointer-events-none" />

        {/* Accent bar on the left edge */}
        <div className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-emerald-400 via-green-500 to-emerald-600 dark:from-emerald-500 dark:via-green-400 dark:to-emerald-600" />

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-5 flex-1 min-w-0">
              {icon && (
                <div className="hero-icon-wrap relative shrink-0">
                  <div className="hero-icon-ring absolute inset-0 rounded-2xl bg-emerald-400 dark:bg-emerald-500 opacity-0" />
                  {/* Icon container */}
                  <div className="relative w-14 h-14 flex items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25 dark:shadow-emerald-900/40 ring-1 ring-white/20">
                    {icon}
                  </div>
                </div>
              )}

              <div className="hero-text-block min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight truncate">
                  {title}
                </h1>
                <p className="mt-0.5 text-sm md:text-base text-foreground leading-snug line-clamp-2">
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Right: actions slot */}
            {actions && (
              <div className="hero-actions shrink-0 flex items-center gap-2 sm:ml-4">{actions}</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
