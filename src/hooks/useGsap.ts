'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

interface GsapEnv {
  reduced: boolean;
  desktop: boolean;
  fine: boolean;
}

/**
 * Scoped GSAP context: every tween / ScrollTrigger / SplitText created inside
 * `setup` is reverted on unmount or when deps change. `setup` receives the
 * motion environment so each section decides how much to animate.
 */
export function useGsap<T extends HTMLElement = HTMLElement>(
  setup: (env: GsapEnv, scope: T) => void | (() => void),
  deps: React.DependencyList = [],
) {
  const scope = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    if (!scope.current) return;
    const env: GsapEnv = {
      reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      desktop: window.matchMedia('(min-width: 1024px)').matches,
      fine: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    };
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => {
      cleanup = setup(env, scope.current!);
    }, scope);
    return () => {
      cleanup?.();
      ctx.revert();
    };
  }, deps);

  return scope;
}
