'use client';

import { ScrollTrigger } from '@/lib/gsap';
import { FORMATIONS, type Formation } from '@/lib/scene-state';

/**
 * Scroll choreography of the Network Core.
 *
 * ScrollTrigger only records progress per transition. The target formation is
 * derived from those numbers every frame, so jumping anywhere on the page
 * (anchor links, terminal `goto`, refresh mid-page) always resolves to the
 * right state — no tween ordering issues. The scene then eases towards it.
 */
export const choreo = {
  /** Boot → hero, driven by the boot timeline (0–1). */
  intro: 0,
  /** hero → identity, identity → flat, flat → contact, contact → end. */
  segments: [0, 0, 0, 0],
};

/** Camera: fov 30° at z = 15 → visible height of the z = 0 plane in world units. */
const VISIBLE_H = 2 * 15 * Math.tan((15 * Math.PI) / 180);
const end = { ...FORMATIONS.end };

/** World-space y that puts the folded line exactly on the footer rule. */
function endLineY() {
  const rule = document.querySelector('[data-end-rule]');
  if (!rule) return FORMATIONS.end.y;
  const y = rule.getBoundingClientRect().top;
  return -((y - window.innerHeight / 2) / window.innerHeight) * VISIBLE_H;
}

const KEYS: (keyof Formation)[] = ['x', 'y', 'scale', 'spread', 'tilt', 'turn', 'opacity', 'energy'];

function mix(out: Formation, a: Formation, b: Formation, t: number) {
  for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const tmp: Formation = { ...FORMATIONS.hero };

export function computeTarget(out: Formation, mobile: boolean) {
  const H = mobile ? FORMATIONS.heroMobile : FORMATIONS.hero;
  const I = mobile ? FORMATIONS.identityMobile : FORMATIONS.identity;
  const C = mobile ? FORMATIONS.contactMobile : FORMATIONS.contact;
  const F = FORMATIONS.flat;
  const [p0, p1, p2, p3] = choreo.segments;

  if (p3 > 0) {
    end.y = endLineY();
    // Below the camera axis the plane is seen from above; tilt it so it passes
    // through the eye point and projects to a perfect line again.
    end.tilt = Math.atan(end.y / 15);
    mix(out, C, end, smooth(p3));
  } else if (p2 > 0) mix(out, F, C, smooth(p2));
  else if (p1 > 0) mix(out, I, F, smooth(p1));
  else mix(out, H, I, smooth(p0));

  if (choreo.intro < 1) {
    Object.assign(tmp, out);
    mix(out, FORMATIONS.boot, tmp, choreo.intro);
  }
  return out;
}

export function createCoreTriggers() {
  const segment = (i: number, trigger: string, start: string, end: string) =>
    ScrollTrigger.create({
      trigger,
      start,
      end,
      // Refresh after every pinned section so pin spacing is accounted for.
      refreshPriority: -10,
      onUpdate: (self) => {
        choreo.segments[i] = self.progress;
      },
      onRefresh: (self) => {
        choreo.segments[i] = self.progress;
      },
    });

  const triggers = [
    segment(0, '#identity', 'top bottom', 'top 15%'),
    segment(1, '#capabilities', 'top 85%', 'top top'),
    segment(2, '#contact', 'top bottom', 'top 10%'),
    segment(3, '[data-end]', 'top bottom', 'bottom bottom'),
  ];

  return () => triggers.forEach((t) => t.kill());
}
