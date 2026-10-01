'use client';

import { useEffect, useRef, useState } from 'react';
import { sectionCount, sections } from '@/data/sections';
import { useApp } from '@/lib/app-state';
import { ScrollTrigger } from '@/lib/gsap';
import styles from './SectionIndicator.module.css';

/**
 * Right-edge readout: current module, page progress and a tick for every
 * section start — a minimap of the narrative.
 */
export function SectionIndicator() {
  const current = useApp((s) => s.section);
  const booted = useApp((s) => s.booted);
  const caseOpen = useApp((s) => s.caseSlug !== null);
  const fill = useRef<HTMLSpanElement>(null);
  const [ticks, setTicks] = useState<number[]>([]);

  const meta = sections.find((s) => s.id === current) ?? sections[0];

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      fill.current?.style.setProperty('--p', String(max > 0 ? window.scrollY / max : 0));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      setTicks(
        sections.slice(1).map((s) => {
          const el = document.getElementById(s.id);
          return el ? Math.min(1, (el.getBoundingClientRect().top + window.scrollY) / max) : 0;
        }),
      );
      update();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    ScrollTrigger.addEventListener('refresh', measure);
    measure();
    return () => {
      window.removeEventListener('scroll', onScroll);
      ScrollTrigger.removeEventListener('refresh', measure);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <aside className={styles.indicator} data-visible={booted && !caseOpen} aria-hidden="true">
      <span className={styles.count}>
        <span key={meta.index} className={styles.current}>
          {meta.index}
        </span>
        <span className={styles.total}>/ {String(sectionCount).padStart(2, '0')}</span>
      </span>
      <span className={styles.track}>
        <span ref={fill} className={styles.fill} />
        {ticks.map((p, i) => (
          <span
            key={sections[i + 1].id}
            className={styles.tick}
            data-active={sections[i + 1].id === current}
            style={{ '--y': p } as React.CSSProperties}
          />
        ))}
      </span>
      <span key={meta.module} className={styles.label}>
        {meta.module}
      </span>
    </aside>
  );
}
