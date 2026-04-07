'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export interface TurnstileRef {
  reset: () => void;
}

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
    };
  }
}

const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(({ onVerify, onExpire }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // expose reset ke parent
  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }));

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    const renderWidget = () => {
      if (!containerRef.current || widgetIdRef.current !== null || !window.turnstile) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onVerify(token),
        'expired-callback': () => {
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
          }
          onExpire?.();
        },
        theme: 'light',
      });
    };

    // jika sudah ada di window
    if (window.turnstile) {
      renderWidget();
      return;
    }

    let script: HTMLScriptElement | null = null;

    const existingScript = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]',
    ) as HTMLScriptElement | null;

    if (!existingScript) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else {
      // handle race condition
      if ((window as any).turnstile) {
        renderWidget();
      } else {
        existingScript.addEventListener('load', renderWidget);
      }
    }

    return () => {
      if (script) {
        script.onload = null;
      }
      if (existingScript) {
        existingScript.removeEventListener('load', renderWidget);
      }
    };
  }, [onVerify, onExpire]);

  return <div ref={containerRef} className="flex justify-center" />;
});

Turnstile.displayName = 'Turnstile';

export default Turnstile;
