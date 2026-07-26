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
      remove?: (widgetId: string) => void;
    };
  }
}

const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(({ onVerify, onExpire }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
  });

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }));

  const getTheme = () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  const destroyWidget = () => {
    if (!containerRef.current) return;

    if (widgetIdRef.current && window.turnstile?.remove) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {}
    }

    containerRef.current.innerHTML = '';
    widgetIdRef.current = null;
  };

  const renderWidget = () => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!containerRef.current || !window.turnstile || !siteKey) return;

    destroyWidget();

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: getTheme(),
      callback: (token: string) => onVerifyRef.current(token),
      'expired-callback': () => onExpireRef.current?.(),
    });
  };

  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    const existingScript = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]',
    ) as HTMLScriptElement | null;

    const init = () => {
      if (window.turnstile) renderWidget();
    };

    if (!existingScript) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = init;
      document.head.appendChild(script);
    } else {
      if (window.turnstile) {
        init();
      } else {
        existingScript.addEventListener('load', init);
      }
    }

    const observer = new MutationObserver(() => {
      renderWidget();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      destroyWidget();

      if (script) script.onload = null;
      if (existingScript) {
        existingScript.removeEventListener('load', init);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="flex justify-center" />;
});

Turnstile.displayName = 'Turnstile';

export default Turnstile;
