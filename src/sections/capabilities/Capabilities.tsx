'use client';

import { useCallback, useRef, useState } from 'react';
import { copy } from '@/data/copy';
import { skillCategories, skillCount, type SkillCategoryId } from '@/data/skills';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Icon } from '@/lib/icons';
import { useLang } from '@/lib/i18n';
import { scrollToTarget } from '@/lib/scroll';
import { useGsap } from '@/hooks/useGsap';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { SkillGraph } from './SkillGraph';
import { SkillNetworkMobile } from './SkillNetworkMobile';
import styles from './Capabilities.module.css';

/** Scroll progress map of the pinned stage: a short overview, then one segment per domain. */
const OVERVIEW = 0.08;
const SEGMENT = (1 - OVERVIEW) / skillCategories.length;

export function Capabilities() {
  const { t, lang } = useLang();
  const reduced = useReducedMotion();
  const [active, setActive] = useState<SkillCategoryId | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const segRef = useRef(-1);
  const stRef = useRef<ScrollTrigger | null>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const c = copy.capabilities;

  const scope = useGsap<HTMLElement>(
    ({ reduced: rm, desktop }, el) => {
      const stage = el.querySelector<HTMLElement>(`.${styles.stage}`);
      if (!desktop || !stage) return;

      // Network draws itself in when the stage arrives.
      if (!rm) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top 70%', once: true } });
        tl.from(el.querySelectorAll('[data-draw]'), { drawSVG: '0%', duration: 1.4, stagger: 0.12, ease: 'av-in-out' })
          .from(
            el.querySelectorAll(`.${styles.panel} [data-in]`),
            { opacity: 0, y: 20, duration: 0.9, stagger: 0.07, ease: 'av-out' },
            0.1,
          );
      }

      if (rm) {
        setActive('security');
        return;
      }

      const st = ScrollTrigger.create({
        trigger: el.querySelector(`.${styles.pin}`),
        start: 'top top',
        end: () => `+=${window.innerHeight * 2.8}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          const seg = p < OVERVIEW ? -1 : Math.min(skillCategories.length - 1, Math.floor((p - OVERVIEW) / SEGMENT));
          if (seg !== segRef.current) {
            segRef.current = seg;
            setActive(seg < 0 ? null : skillCategories[seg].id);
            setHovered(null);
          }
          bars.current.forEach((bar, i) => {
            const local = gsap.utils.clamp(0, 1, (p - OVERVIEW - i * SEGMENT) / SEGMENT);
            bar?.style.setProperty('--p', String(local));
          });
        },
      });
      stRef.current = st;
      return () => {
        stRef.current = null;
      };
    },
    [],
  );

  /** Tabs jump the scroll position to their segment, keeping scroll and state in sync. */
  const select = useCallback((id: SkillCategoryId) => {
    const st = stRef.current;
    const i = skillCategories.findIndex((cat) => cat.id === id);
    if (!st) {
      setActive(id);
      return;
    }
    const target = st.start + (st.end - st.start) * (OVERVIEW + SEGMENT * i + SEGMENT * 0.15);
    scrollToTarget(target);
  }, []);

  const current = skillCategories.find((cat) => cat.id === active) ?? null;

  return (
    <section ref={scope} id="capabilities" className={styles.capabilities} aria-labelledby="capabilities-title">
      <div className={styles.pin}>
        <div className={`container ${styles.inner}`}>
          <ModuleHeader
            index="02"
            module="Skill Network"
            meta={`${skillCount} ${t(c.nodes)} · ${skillCategories.length} ${t(c.domains)}`}
          />

          <div className={styles.stage}>
            <div className={styles.panel}>
              <h2 id="capabilities-title" className={styles.title} data-in>
                {t(c.title)}
              </h2>
              <p className={styles.intro} data-in>
                {t(c.intro)}
              </p>

              <div className={styles.tabs} role="tablist" aria-label={t(c.tabsLabel)} data-in>
                {skillCategories.map((cat, i) => {
                  const selected = active === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      id={`tab-${cat.id}`}
                      aria-selected={selected}
                      aria-controls="capability-panel"
                      tabIndex={selected || (!active && i === 0) ? 0 : -1}
                      className={styles.tab}
                      onClick={() => select(cat.id)}
                      onPointerEnter={() => setActive(cat.id)}
                      onFocus={() => setActive(cat.id)}
                      onKeyDown={(e) => {
                        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
                        e.preventDefault();
                        const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + skillCategories.length) % skillCategories.length;
                        document.getElementById(`tab-${skillCategories[next].id}`)?.focus();
                      }}
                    >
                      <span className={styles.tabIndex} aria-hidden="true">
                        {cat.index}
                      </span>
                      <span className={styles.tabIcon} aria-hidden="true">
                        <Icon name={cat.icon} size={15} />
                      </span>
                      <span className={styles.tabName}>{t(cat.name)}</span>
                      <span className={styles.tabCount}>
                        {String(cat.skills.length).padStart(2, '0')}
                        <span className="sr-only"> {t(c.nodes)}</span>
                      </span>
                      <span className={styles.tabBar} aria-hidden="true">
                        <span ref={(n) => void (bars.current[i] = n)} />
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                id="capability-panel"
                role="tabpanel"
                aria-labelledby={current ? `tab-${current.id}` : undefined}
                className={styles.detail}
                data-in
              >
                {current ? (
                  <div key={`${current.id}-${lang}`} className={styles.detailInner}>
                    <p className={styles.description}>{t(current.description)}</p>
                    <p className={styles.listLabel}>
                      {t(c.listLabel)} {t(current.name)}
                    </p>
                    <ul className={styles.skillList}>
                      {current.skills.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            className={styles.skill}
                            data-hot={hovered === s.id}
                            onPointerEnter={() => setHovered(s.id)}
                            onPointerLeave={() => setHovered(null)}
                            onFocus={() => setHovered(s.id)}
                            onBlur={() => setHovered(null)}
                            aria-describedby={`note-${s.id}`}
                          >
                            {t(s.name)}
                          </button>
                          <span id={`note-${s.id}`} className="sr-only">
                            {t(s.note)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className={styles.overview}>
                    {skillCategories.map((cat) => (
                      <span key={cat.id}>
                        <span className={styles.overviewCode}>{cat.code}</span> {t(cat.name)}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.graph}>
              <SkillGraph
                active={active}
                hovered={hovered}
                onHoverSkill={setHovered}
                onHoverHub={setActive}
                reduced={reduced}
              />
            </div>
          </div>

          <SkillNetworkMobile />
        </div>
      </div>
    </section>
  );
}
