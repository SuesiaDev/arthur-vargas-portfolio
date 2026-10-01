'use client';

import { useEffect, useState } from 'react';
import { copy } from '@/data/copy';
import { languages, now, timeline } from '@/data/education';
import { gsap } from '@/lib/gsap';
import { useLang } from '@/lib/i18n';
import { useGsap } from '@/hooks/useGsap';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { StatusDot } from '@/components/ui/StatusDot';
import styles from './Trajectory.module.css';

/** Ruler ticks, aligned with the node columns (2023 → 0, 2026 → ⅓, now → ⅔). */
const TICKS = [
  { label: '2023', x: 0 },
  { label: '2024', x: 1 / 9 },
  { label: '2025', x: 2 / 9 },
  { label: '2026', x: 1 / 3 },
  { label: '', x: 4 / 9 },
  { label: '', x: 5 / 9 },
  { label: 'Now', x: 2 / 3 },
];

function RotatingWord() {
  const { t } = useLang();
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % now.words.length), 2400);
    return () => window.clearInterval(id);
  }, [reduced]);

  if (reduced) return <span>{now.words.map((w) => t(w)).join(' / ')}</span>;

  return (
    <span className={styles.rotator} aria-live="off">
      <span key={i} className={styles.rotatorWord}>
        {t(now.words[i])}
      </span>
      <span className="sr-only">{now.words.map((w) => t(w)).join(', ')}</span>
    </span>
  );
}

export function Trajectory() {
  const { t } = useLang();

  const scope = useGsap<HTMLElement>(({ reduced }, el) => {
    const line = el.querySelector<HTMLElement>(`.${styles.lineFill}`);
    const nodes = el.querySelectorAll<HTMLElement>('[data-node]');
    if (reduced) {
      nodes.forEach((n) => (n.dataset.active = 'true'));
      return;
    }

    gsap.from(el.querySelectorAll(`.${styles.head} [data-in]`), {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.08,
      ease: 'av-out',
      scrollTrigger: { trigger: el, start: 'top 75%', once: true },
    });

    // The line draws with the scroll; each node lights up as the line reaches it.
    gsap.fromTo(
      line,
      { '--p': 0 },
      {
        '--p': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el.querySelector(`.${styles.timeline}`),
          start: 'top 78%',
          end: 'bottom 62%',
          scrub: 0.8,
          onUpdate: (self) => {
            nodes.forEach((n) => {
              const at = Number(n.dataset.at);
              n.dataset.active = String(self.progress >= at - 0.001);
            });
          },
        },
      },
    );
  });

  // Node positions along the line (0–1) — matches the three columns.
  const positions = [0, 1 / 3, 2 / 3];

  return (
    <section ref={scope} id="trajectory" className={styles.trajectory} aria-labelledby="trajectory-title">
      <div className="container">
        <ModuleHeader index="04" module="Trajectory" meta="2023 → Now" />

        <div className={styles.head}>
          <h2 id="trajectory-title" className={styles.title} data-in>
            {t(copy.trajectory.title)}
          </h2>
          <p className={styles.intro} data-in>
            {t(copy.trajectory.intro)}
          </p>
        </div>

        <div className={styles.timeline}>
          <div className={styles.ruler} aria-hidden="true">
            <span className={styles.lineBase} />
            <span className={styles.lineFill}>
              <span className={styles.packet} />
            </span>
            {TICKS.map((tick, i) => (
              <span
                key={i}
                className={styles.tick}
                data-minor={!tick.label}
                data-first={i === 0}
                style={{ '--x': tick.x } as React.CSSProperties}
              >
                {tick.label && <span>{tick.label}</span>}
              </span>
            ))}
          </div>

          <ol className={styles.entries}>
            {timeline.map((entry, i) => (
              <li key={entry.id} className={styles.entry} data-node data-at={positions[i]} data-active="false">
                <span className={styles.node} aria-hidden="true" />
                <span className={styles.marker}>{entry.marker}</span>
                <h3 className={styles.institution}>{entry.institution}</h3>
                <p className={styles.program}>{t(entry.program)}</p>
                <p className={styles.period}>
                  {entry.current && <StatusDot />}
                  {t(entry.period)}
                </p>
                <p className={styles.description}>{t(entry.description)}</p>
              </li>
            ))}
            <li className={`${styles.entry} ${styles.now}`} data-node data-at={positions[2]} data-active="false">
              <span className={styles.node} aria-hidden="true" />
              <span className={styles.marker}>{now.marker}</span>
              <h3 className={styles.institution}>
                <RotatingWord />
              </h3>
              <p className={styles.description}>{t(now.description)}</p>
            </li>
          </ol>
        </div>

        <dl className={styles.languages}>
          <dt>{t(copy.trajectory.languages)}</dt>
          {languages.map((l) => (
            <dd key={l.name.en}>
              <span>{t(l.name)}</span>
              <span className={styles.level}>{t(l.level)}</span>
            </dd>
          ))}
        </dl>
      </div>
    </section>
  );
}
