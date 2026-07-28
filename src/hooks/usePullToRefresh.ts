'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isAtTop = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    isAtTop.current = window.scrollY === 0;
    startY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isAtTop.current) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) setPullDistance(Math.min(diff * 0.5, 120));
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 80 && !isRefreshing) {
      setIsRefreshing(true);
      onRefresh().finally(() => setIsRefreshing(false));
    }
    setPullDistance(0);
    isAtTop.current = false;
  }, [pullDistance, isRefreshing, onRefresh]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pullDistance, isRefreshing };
}
