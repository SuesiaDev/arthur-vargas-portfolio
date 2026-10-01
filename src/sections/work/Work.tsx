'use client';

import { useRef } from 'react';
import { copy } from '@/data/copy';
import { projects } from '@/data/projects';
import { gsap } from '@/lib/gsap';
import { useLang } from '@/lib/i18n';
import { useGsap } from '@/hooks/useGsap';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { ProjectCard } from './ProjectCard';
import styles from './Work.module.css';

export function Work() {
  const { t } = useLang();
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const total = projects.length;
  const pad = (n: number) => String(n).padStart(2, '0');

  const scope = useGsap<HTMLElement>(({ reduced, desktop }, el) => {
    const track = el.querySelector<HTMLElement>(`.${styles.track}`);
    const pin = el.querySelector<HTMLElement>(`.${styles.pin}`);
    if (!track || !pin) return;

    if (!desktop || reduced) {
      // Vertical layout: cards rise in as they enter.
      if (reduced) return;
      el.querySelectorAll('[data-project-card], [data-slot]').forEach((card) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 1.1,
          ease: 'av-out',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        });
      });
      return;
    }

    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const horizontal = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          bar.current?.style.setProperty('--p', self.progress.toFixed(4));
          const i = Math.min(total, Math.max(1, Math.round(self.progress * total + 0.35)));
          if (counter.current) counter.current.textContent = pad(i);
        },
      },
    });

    // Depth: cards settle in as they travel across, artwork drifts inside its frame.
    el.querySelectorAll<HTMLElement>('[data-project-card], [data-slot]').forEach((card) => {
      gsap.fromTo(
        card,
        { scale: 0.94, opacity: 0.4 },
        {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: horizontal, start: 'left right', end: 'left 45%', scrub: true },
        },
      );
      const media = card.querySelector('[data-parallax]');
      if (media) {
        gsap.fromTo(
          media,
          { xPercent: -4 },
          {
            xPercent: 4,
            ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true },
          },
        );
      }
    });

    gsap.from(el.querySelectorAll(`.${styles.intro} [data-in]`), {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.08,
      ease: 'av-out',
      scrollTrigger: { trigger: pin, start: 'top 70%', once: true },
    });
  });

  return (
    <section ref={scope} id="work" className={styles.work} aria-labelledby="work-title">
      <div className={styles.pin}>
        <div className={styles.track}>
          <div className={styles.intro}>
            <ModuleHeader index="03" module="Project Database" meta={`${pad(total)} ${t(copy.work.records)}`} />
            <h2 id="work-title" className={styles.title} data-in>
              {t(copy.work.title)}
            </h2>
            <p className={styles.lead} data-in>
              {t(copy.work.intro)}
            </p>
            <ol className={styles.index} data-in>
              {projects.map((p) => (
                <li key={p.slug}>
                  <span>{p.index}</span>
                  <span>{p.client}</span>
                  <span className={styles.indexType}>{t(p.type)}</span>
                </li>
              ))}
            </ol>
            <p className={styles.hint} data-in aria-hidden="true">
              <span>{t(copy.work.hint)}</span>
              <span className={styles.hintArrow} />
            </p>
          </div>

          {projects.map((p) => (
            <div key={p.slug} className={styles.cardSlot}>
              <ProjectCard project={p} total={total} />
            </div>
          ))}

          <div className={styles.next} data-slot>
            <div className={styles.nextFrame}>
              <span className={styles.nextIndex}>{pad(total + 1)}</span>
              <p className={styles.nextTitle}>{t(copy.work.slotTitle)}</p>
              <p className={styles.nextText}>
                {t(copy.work.slotText)}
                <span className={styles.caret} aria-hidden="true" />
              </p>
            </div>
          </div>
        </div>

        <div className={`container ${styles.progress}`} aria-hidden="true">
          <span className={styles.progressLabel}>Case files</span>
          <span className={styles.progressTrack}>
            <span ref={bar} />
          </span>
          <span className={styles.progressCount}>
            <span ref={counter}>01</span> / {pad(total)}
          </span>
        </div>
      </div>
    </section>
  );
}
