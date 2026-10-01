'use client';

import { useGsap } from '@/hooks/useGsap';
import { gsap } from '@/lib/gsap';
import { Scramble } from './Scramble';
import styles from './ModuleHeader.module.css';

interface ModuleHeaderProps {
  index: string;
  module: string;
  meta?: string;
  className?: string;
}

/**
 * The connective tissue of the narrative: every section opens with the same
 * system readout — index, a rule that draws in, the module name and metadata.
 */
export function ModuleHeader({ index, module, meta, className }: ModuleHeaderProps) {
  const ref = useGsap<HTMLDivElement>(({ reduced }, el) => {
    if (reduced) return;
    gsap.from(el.querySelector(`.${styles.rule}`), {
      scaleX: 0,
      duration: 1.2,
      ease: 'av-in-out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });

  return (
    <div ref={ref} className={`${styles.header} ${className ?? ''}`}>
      <span className={styles.index}>
        <span className={styles.bracket}>[</span>
        {index}
        <span className={styles.bracket}>]</span>
      </span>
      <span className={styles.rule} aria-hidden="true" />
      <Scramble text={module} className={styles.module} />
      {meta && <span className={styles.meta}>{meta}</span>}
    </div>
  );
}
