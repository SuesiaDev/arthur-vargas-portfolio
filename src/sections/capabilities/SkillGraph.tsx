'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { allSkills, skillCategories, type SkillCategoryId } from '@/data/skills';
import { copy } from '@/data/copy';
import { gsap } from '@/lib/gsap';
import { Icon } from '@/lib/icons';
import { useLang } from '@/lib/i18n';
import { CORE, HUBS, LAYOUT, RADIUS, VIEW, openRadius, skillPoint, viewBoxFor } from './layout';
import styles from './SkillGraph.module.css';

/** Undirected adjacency of cross-links between skills. */
const RELATIONS = (() => {
  const map = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (!map.has(a)) map.set(a, new Set());
    map.get(a)!.add(b);
  };
  for (const s of allSkills) for (const r of s.related ?? []) {
    link(s.id, r);
    link(r, s.id);
  }
  return map;
})();

export function relatedOf(id: string | null) {
  return id ? [...(RELATIONS.get(id) ?? [])] : [];
}

interface SkillGraphProps {
  active: SkillCategoryId | null;
  hovered: string | null;
  onHoverSkill: (id: string | null) => void;
  onHoverHub: (id: SkillCategoryId) => void;
  reduced: boolean;
}

export function SkillGraph({ active, hovered, onHoverSkill, onHoverHub, reduced }: SkillGraphProps) {
  const { t } = useLang();
  const svg = useRef<SVGSVGElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number; flip: boolean } | null>(null);
  const related = useMemo(() => new Set(relatedOf(hovered)), [hovered]);
  const hoveredSkill = hovered ? allSkills.find((s) => s.id === hovered) : null;

  // Camera: tween the viewBox between the overview and a focused domain.
  useEffect(() => {
    if (!svg.current) return;
    const tween = gsap.to(svg.current, {
      attr: { viewBox: viewBoxFor(active) },
      duration: reduced ? 0 : 1.35,
      ease: 'av-in-out',
      onUpdate: () => {
        if (!readout.current || !svg.current) return;
        const w = svg.current.viewBox.baseVal.width || VIEW.w;
        readout.current.textContent = `${(VIEW.w / w).toFixed(2)}×`;
      },
    });
    return () => {
      tween.kill();
    };
  }, [active, reduced]);

  // Tooltip position — mapped from SVG space to the wrapper's CSS pixels.
  useEffect(() => {
    if (!hovered || !svg.current || !wrap.current) {
      setTip(null);
      return;
    }
    const p = skillPoint(hovered, active);
    const ctm = svg.current.getScreenCTM();
    if (!p || !ctm) return;
    const pt = new DOMPoint(p.x, p.y).matrixTransform(ctm);
    const box = wrap.current.getBoundingClientRect();
    const x = pt.x - box.left;
    setTip({ x, y: pt.y - box.top, flip: x > box.width * 0.6 });
  }, [hovered, active]);

  const onMove = (e: React.PointerEvent) => {
    if (!svg.current || !readout.current) return;
    const ctm = svg.current.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const coord = readout.current.previousElementSibling as HTMLElement | null;
    if (coord) coord.textContent = `X ${String(Math.round(p.x)).padStart(4, '0')} · Y ${String(Math.round(p.y)).padStart(4, '0')}`;
  };

  return (
    <div
      ref={wrap}
      className={styles.wrap}
      data-cursor="explore"
      data-cursor-label={t({ pt: 'Explorar', en: 'Explore' })}
      onPointerMove={onMove}
    >
      <svg
        ref={svg}
        className={styles.svg}
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        data-hovering={hovered ? 'true' : 'false'}
      >
        <defs>
          <pattern id="sg-dots" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" className={styles.patternDot} />
          </pattern>
          <radialGradient id="sg-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9cc8f2" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#9cc8f2" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x={-600} y={-450} width={VIEW.w * 2} height={VIEW.h * 2} fill="url(#sg-dots)" />

        {/* Core ↔ domain links with data packets */}
        <g className={styles.links}>
          {skillCategories.map((c) => {
            const h = HUBS[c.id];
            const d = `M${CORE.x} ${CORE.y} L${h.x} ${h.y}`;
            return (
              <g key={c.id} data-active={active === c.id}>
                <path d={d} className={styles.link} data-draw />
                {!reduced && (
                  <>
                    <circle r="2.4" className={styles.packet}>
                      <animateMotion dur={`${2.6 + c.skills.length * 0.08}s`} repeatCount="indefinite" path={d} />
                    </circle>
                    <circle r="1.8" className={styles.packet}>
                      <animateMotion
                        dur="3.8s"
                        begin="1.2s"
                        repeatCount="indefinite"
                        path={d}
                        keyPoints="1;0"
                        keyTimes="0;1"
                        calcMode="linear"
                      />
                    </circle>
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* Cross-domain links for the hovered skill */}
        <g className={styles.cross}>
          {hovered &&
            [...related].map((rid) => {
              const a = skillPoint(hovered, active);
              const b = skillPoint(rid, active);
              if (!a || !b) return null;
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2;
              const cx = mx + (CORE.x - mx) * 0.45;
              const cy = my + (CORE.y - my) * 0.45;
              return <path key={rid} d={`M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`} className={styles.crossPath} />;
            })}
        </g>

        {skillCategories.map((c) => {
          const hub = HUBS[c.id];
          const isOpen = active === c.id;
          const r = isOpen ? openRadius(c.skills.length) : RADIUS.closed;
          const state = isOpen ? 'open' : active ? 'dim' : 'idle';
          return (
            <g key={c.id} transform={`translate(${hub.x} ${hub.y})`} className={styles.hub} data-state={state}>
              <circle r={openRadius(c.skills.length)} className={styles.orbit} />

              {LAYOUT[c.id].map((sat, i) => (
                <line
                  key={sat.id}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                  className={styles.spoke}
                  style={
                    {
                      '--a': `${sat.angle}deg`,
                      '--r': String(r),
                      '--d': `${isOpen ? i * 26 : 0}ms`,
                    } as React.CSSProperties
                  }
                  data-hot={hovered === sat.id || related.has(sat.id)}
                />
              ))}

              {c.skills.map((s, i) => {
                const sat = LAYOUT[c.id][i];
                const anchor = sat.dx > 0.25 ? 'start' : sat.dx < -0.25 ? 'end' : 'middle';
                const lx = Math.round(sat.dx * 260) / 10;
                const ly = Math.round((sat.dy * 26 + (Math.abs(sat.dx) <= 0.25 ? (sat.dy > 0 ? 10 : -4) : 4.5)) * 10) / 10;
                const isHot = hovered === s.id;
                const isRelated = related.has(s.id);
                return (
                  <g
                    key={s.id}
                    className={styles.sat}
                    style={
                      {
                        '--a': `${sat.angle}deg`,
                        '--r': `${r}px`,
                        '--d': `${isOpen ? i * 26 : 0}ms`,
                      } as React.CSSProperties
                    }
                    data-hot={isHot}
                    data-related={isRelated}
                    data-cursor={isOpen ? 'link' : undefined}
                    onPointerEnter={() => isOpen && onHoverSkill(s.id)}
                    onPointerLeave={() => onHoverSkill(null)}
                  >
                    <circle r="24" className={styles.hit} />
                    <circle r="15" className={styles.satBg} />
                    <g className={styles.satIcon}>
                      <Icon name={s.icon} size={15} x={-7.5} y={-7.5} strokeWidth={1.4} />
                    </g>
                    <text x={lx} y={ly} textAnchor={anchor} className={styles.satLabel}>
                      {t(s.name)}
                    </text>
                  </g>
                );
              })}

              <g className={styles.hubNode} data-cursor="link" onPointerEnter={() => onHoverHub(c.id)}>
                <circle r="44" className={styles.hubHalo} />
                <circle r="36" className={styles.hubRing} />
                <circle r="30" className={styles.hubFill} />
                <text y="-3" textAnchor="middle" className={styles.hubCode}>
                  {c.code}
                </text>
                <text y="13" textAnchor="middle" className={styles.hubIndex}>
                  {c.index}
                </text>
              </g>
              <text
                textAnchor="middle"
                className={styles.hubName}
                style={{ '--ty': `${r + 36}px` } as React.CSSProperties}
              >
                {t(c.name)}
              </text>
            </g>
          );
        })}

        <g transform={`translate(${CORE.x} ${CORE.y})`} className={styles.core}>
          <circle r="90" fill="url(#sg-core)" />
          <circle r="58" className={styles.coreOrbit} />
          <circle r="42" className={styles.coreRing} />
          <circle r="28" className={styles.coreFill} />
          <g className={styles.coreIcon}>
            <Icon name="brain" size={26} x={-13} y={-13} strokeWidth={1.4} />
          </g>
        </g>
      </svg>

      {/* HUD */}
      <div className={styles.hud} aria-hidden="true">
        <span>{t(copy.capabilities.hint)}</span>
        <span className={styles.hudRight}>
          <span>X 0000 · Y 0000</span>
          <span ref={readout}>1.00×</span>
        </span>
      </div>

      {hoveredSkill && tip && (
        <div
          className={styles.tooltip}
          data-flip={tip.flip}
          style={{ '--x': `${tip.x}px`, '--y': `${tip.y}px` } as React.CSSProperties}
          role="tooltip"
        >
          <span className={styles.tipCat}>
            {skillCategories.find((c) => c.id === hoveredSkill.category)?.code} ·{' '}
            {skillCategories.find((c) => c.id === hoveredSkill.category)?.index}
          </span>
          <strong className={styles.tipName}>{t(hoveredSkill.name)}</strong>
          <span className={styles.tipNote}>{t(hoveredSkill.note)}</span>
          {related.size > 0 && (
            <span className={styles.tipLinks}>
              {t(copy.capabilities.links)}:{' '}
              {[...related].map((id) => t(allSkills.find((s) => s.id === id)!.name)).join(' · ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
