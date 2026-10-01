'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** SSR-safe media query. Returns `fallback` on the server and first paint. */
export function useMediaQuery(query: string, fallback = false) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)', true);
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');
