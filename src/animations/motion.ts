/**
 * Motion system — mirrors the CSS tokens in styles/tokens.css.
 *
 *   fast     150–250ms   hover, press, cursor
 *   ui       300–500ms   state changes, menus, tooltips
 *   reveal   600–900ms   editorial text and media reveals
 *   section  800–1400ms  section / view transitions, 3D formations
 *
 * Curves are registered with CustomEase in lib/gsap.ts so CSS and GSAP
 * animations share the exact same acceleration profile.
 */
export const DURATION = {
  fast: 0.2,
  ui: 0.42,
  reveal: 0.85,
  section: 1.2,
} as const;

export const EASE = {
  /** expo-out — content entering, reveals, settling */
  out: 'av-out',
  /** quart-out — UI feedback */
  soft: 'av-soft',
  /** quart in-out — transitions between states */
  inOut: 'av-in-out',
  /** linear for scrubbed timelines (scroll provides the easing) */
  none: 'none',
} as const;

export const CURVES = {
  'av-out': '0.16,1,0.3,1',
  'av-soft': '0.25,1,0.5,1',
  'av-in-out': '0.76,0,0.24,1',
} as const;

export const STAGGER = {
  chars: 0.028,
  words: 0.05,
  lines: 0.09,
  items: 0.07,
} as const;
