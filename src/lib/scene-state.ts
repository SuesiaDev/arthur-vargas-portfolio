/**
 * Shared, mutable state for the Network Core (WebGL).
 *
 * Written by GSAP / ScrollTrigger / pointer handlers, read every frame by the
 * scene. Deliberately not React state: nothing here should trigger a render.
 */
export interface Formation {
  /** World-space offset of the structure. */
  x: number;
  y: number;
  scale: number;
  /** Vertical distance between layers (0 = all layers collapsed into one plane). */
  spread: number;
  /** Tilt towards the camera in radians (0 = edge-on, π/2 = top-down). */
  tilt: number;
  /** Base rotation around the vertical axis. */
  turn: number;
  /** Global opacity of the canvas (0 stops rendering). */
  opacity: number;
  /** Data-packet activity, 0–1. */
  energy: number;
}

export const FORMATIONS = {
  /** Boot: every layer collapsed and seen edge-on — it reads as a single line. */
  boot: { x: 0, y: 0, scale: 1.35, spread: 0, tilt: 0, turn: 0.35, opacity: 1, energy: 0 },
  hero: { x: 2.65, y: 0.62, scale: 0.9, spread: 0.46, tilt: 0.46, turn: 0.62, opacity: 1, energy: 0.7 },
  heroMobile: { x: 0, y: 1.25, scale: 0.68, spread: 0.4, tilt: 0.5, turn: 0.62, opacity: 0.85, energy: 0.6 },
  identity: { x: -2.55, y: -0.2, scale: 1.12, spread: 0.92, tilt: 0.3, turn: 1.75, opacity: 0.26, energy: 1 },
  identityMobile: { x: 0, y: 0.4, scale: 0.8, spread: 0.8, tilt: 0.34, turn: 1.75, opacity: 0.16, energy: 0.6 },
  /** Layers fold into one plane seen from above — handing over to the Skill Network. */
  flat: { x: 0, y: 0, scale: 1.7, spread: 0, tilt: 1.5, turn: 2.6, opacity: 0, energy: 0.2 },
  contact: { x: 1.9, y: 0.75, scale: 0.82, spread: 0.36, tilt: 0.42, turn: 3.6, opacity: 0.48, energy: 0.8 },
  contactMobile: { x: 0, y: 1.9, scale: 0.55, spread: 0.32, tilt: 0.46, turn: 3.6, opacity: 0.35, energy: 0.6 },
  /** End of page: the structure folds back into the boot line, resting on the footer rule. */
  end: { x: 0, y: -2, scale: 1.45, spread: 0, tilt: 0, turn: 3.6, opacity: 0.85, energy: 0.2 },
} satisfies Record<string, Formation>;

export const scene = {
  formation: { ...FORMATIONS.boot } as Formation,
  /** Normalised pointer, -1..1. */
  pointer: { x: 0, y: 0 },
  /** User drag rotation with inertia. */
  drag: { angle: 0, velocity: 0, active: false },
  /** Short-lived boost (e.g. hovering the primary CTA). */
  excite: 0,
  /** Set by the scene once WebGL is up. */
  ready: false,
  reducedMotion: false,
  isMobile: false,
};
