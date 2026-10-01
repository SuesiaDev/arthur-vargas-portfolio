import { skillCategories, type SkillCategoryId } from '@/data/skills';

/**
 * Geometry of the Skill Network, in SVG user units.
 * The "camera" is the viewBox: overview shows everything, focusing a domain
 * frames its hub so the expanded ring and labels read comfortably.
 */
export const VIEW = { w: 1200, h: 900 };
export const CORE = { x: 600, y: 450 };

export const HUBS: Record<SkillCategoryId, { x: number; y: number }> = {
  security: { x: 330, y: 268 },
  development: { x: 872, y: 262 },
  ai: { x: 884, y: 640 },
  tools: { x: 318, y: 632 },
};

export const RADIUS = { open: 172, openSmall: 138, closed: 44 };

/** Trig results can differ in the last ulp between Node and browsers — round for stable SSR. */
const round = (v: number, p = 1e4) => Math.round(v * p) / p;
const FOCUS = { w: 800, h: 600 };

/** Angles (deg) for a domain's satellites: a 300° arc with the gap facing the core. */
export function satelliteAngles(id: SkillCategoryId, count: number) {
  const hub = HUBS[id];
  const toCore = (Math.atan2(CORE.y - hub.y, CORE.x - hub.x) * 180) / Math.PI;
  const arc = count > 6 ? 300 : 260;
  const start = toCore + (360 - arc) / 2;
  return Array.from({ length: count }, (_, i) => round(start + (count === 1 ? 0 : (i * arc) / (count - 1)), 100));
}

export function openRadius(count: number) {
  return count > 6 ? RADIUS.open : RADIUS.openSmall;
}

export interface SatelliteLayout {
  id: string;
  angle: number;
  /** Unit direction, used for label placement. */
  dx: number;
  dy: number;
}

export const LAYOUT = Object.fromEntries(
  skillCategories.map((c) => {
    const angles = satelliteAngles(c.id, c.skills.length);
    return [
      c.id,
      c.skills.map<SatelliteLayout>((s, i) => ({
        id: s.id,
        angle: angles[i],
        dx: round(Math.cos((angles[i] * Math.PI) / 180)),
        dy: round(Math.sin((angles[i] * Math.PI) / 180)),
      })),
    ];
  }),
) as Record<SkillCategoryId, SatelliteLayout[]>;

/** Absolute position of a skill node given which domain is expanded. */
export function skillPoint(skillId: string, active: SkillCategoryId | null) {
  for (const c of skillCategories) {
    const sat = LAYOUT[c.id].find((s) => s.id === skillId);
    if (!sat) continue;
    const r = active === c.id ? openRadius(c.skills.length) : RADIUS.closed;
    return { x: HUBS[c.id].x + sat.dx * r, y: HUBS[c.id].y + sat.dy * r, category: c.id };
  }
  return null;
}

export function viewBoxFor(active: SkillCategoryId | null) {
  if (!active) return `0 0 ${VIEW.w} ${VIEW.h}`;
  const hub = HUBS[active];
  // Lean slightly towards the core so neighbouring domains stay in frame.
  const cx = hub.x + (CORE.x - hub.x) * 0.12;
  const cy = hub.y + (CORE.y - hub.y) * 0.12;
  return `${cx - FOCUS.w / 2} ${cy - FOCUS.h / 2} ${FOCUS.w} ${FOCUS.h}`;
}
