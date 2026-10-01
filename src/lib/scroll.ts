'use client';

import type Lenis from 'lenis';

/**
 * Scroll facade. Components never talk to Lenis directly, so the site keeps
 * working with native scrolling (touch devices, reduced motion, no JS).
 */
let lenis: Lenis | null = null;
let locks = 0;

export function bindLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function scrollToTarget(target: string | HTMLElement | number, opts: { immediate?: boolean; offset?: number } = {}) {
  const el =
    typeof target === 'string' ? document.querySelector<HTMLElement>(target.startsWith('#') ? target : `#${target}`) : target;
  if (el === null) return;
  const immediate = opts.immediate || prefersReducedMotion();

  if (lenis) {
    lenis.scrollTo(el as HTMLElement | number, {
      offset: opts.offset ?? 0,
      immediate,
      duration: 1.6,
      easing: (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),
      force: true,
    });
    return;
  }

  const top = typeof el === 'number' ? el : el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0);
  window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
}

/** Reference-counted scroll lock — boot, menu, terminal (mobile) and case view. */
export function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  lenis?.stop();
  document.documentElement.style.overflow = 'hidden';
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  lenis?.start();
  document.documentElement.style.overflow = '';
}
