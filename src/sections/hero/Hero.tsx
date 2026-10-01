'use client';

import { useEffect, useRef } from 'react';
import { copy } from '@/data/copy';
import { roleLine, site } from '@/data/site';
import { useApp } from '@/lib/app-state';
import { gsap, SplitText } from '@/lib/gsap';
import { useLang } from '@/lib/i18n';
import { scene } from '@/lib/scene-state';
import { useGsap } from '@/hooks/useGsap';
import { Button } from '@/components/ui/Button';
import { StatusDot } from '@/components/ui/StatusDot';
import { DragZone } from './DragZone';
import styles from './Hero.module.css';

export function Hero() {
  const { t, lang } = useLang();
  const booted = useApp((s) => s.booted);
  const played = useRef(false);

  // Scroll-out: the composition recedes as the identity module comes in.
  const scope = useGsap<HTMLElement>(({ reduced }, el) => {
    if (reduced) return;
    const st = { trigger: el, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(el.querySelector(`.${styles.name}`), { yPercent: -16, ease: 'none', scrollTrigger: st });
    gsap.to(el.querySelectorAll('[data-hero-fade]'), {
      y: -40,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { ...st, end: '60% top' },
    });
  });

  // Entrance — starts the moment the boot aperture opens.
  useEffect(() => {
    const el = scope.current;
    if (!booted || played.current || !el) return;
    played.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let completed = false;
    const ctx = gsap.context(() => {
      const split = SplitText.create(el.querySelectorAll(`.${styles.word}`), {
        type: 'chars',
        charsClass: styles.char,
        tag: 'span',
      });
      const tagline = SplitText.create(el.querySelector(`.${styles.tagline}`), { type: 'lines', mask: 'lines' });
      gsap
        .timeline({
          delay: 0.15,
          onComplete: () => {
            completed = true;
            split.revert();
            tagline.revert();
          },
        })
        .from(split.chars, { yPercent: 108, duration: 1.25, stagger: 0.04, ease: 'av-out' }, 0)
        .from(tagline.lines, { yPercent: 105, duration: 1, stagger: 0.08, ease: 'av-out' }, 0.35)
        .from(el.querySelectorAll('[data-hero-in]'), { opacity: 0, y: 14, duration: 0.9, stagger: 0.06, ease: 'av-out' }, 0.45);
    }, el);

    return () => {
      if (completed) return;
      // Interrupted (e.g. StrictMode remount): restore pristine DOM and allow a replay.
      ctx.revert();
      played.current = false;
    };
  }, [booted, scope]);

  return (
    <section ref={scope} id="top" className={styles.hero} aria-labelledby="hero-title">
      <DragZone label={t(copy.hero.drag)} />

      <div className={`container ${styles.inner}`}>
        <div className={styles.topRow} data-hero-fade>
          <p className={styles.kicker} data-hero-in>
            <span className={styles.bracket}>[</span>00<span className={styles.bracket}>]</span>
            <span className={styles.kickerRule} />
            System Interface
          </p>
          <p className={styles.coords} data-hero-in>
            <span>{site.location.coords}</span>
            <span className={styles.dim}>SC · BR</span>
          </p>
        </div>

        <div className={styles.intro} data-hero-fade>
          <p key={lang} className={styles.tagline}>
            {t(copy.hero.tagline)}
          </p>
          <p className={styles.status} data-hero-in>
            <StatusDot />
            <span>{t(copy.hero.status)}</span>
          </p>
        </div>

        <h1 id="hero-title" className={styles.name}>
          <span className="sr-only">{site.name}, </span>
          <span className={styles.nameLine} aria-hidden="true">
            <span className={styles.word}>Arthur</span>
          </span>
          <span className={`${styles.nameLine} ${styles.nameLine2}`} aria-hidden="true">
            <span className={styles.word}>Vargas</span>
          </span>
          <span className="sr-only">{t(roleLine)}</span>
        </h1>

        <div className={styles.bottom}>
          <span className={styles.rule} data-hero-rule aria-hidden="true" />
          <div className={styles.bottomRow} data-hero-fade>
            <p className={styles.role} data-hero-in>
              {t(roleLine)}
            </p>
            <div className={styles.ctas} data-hero-in>
              <Button
                href="#work"
                variant="primary"
                icon="down"
                index="03"
                onPointerEnter={() => (scene.excite = 1)}
                onPointerLeave={() => (scene.excite = 0)}
              >
                {t(copy.hero.ctaWork)}
              </Button>
              <Button href="#identity" index="01">
                {t(copy.hero.ctaAbout)}
              </Button>
              <Button href="#contact" index="05">
                {t(copy.hero.ctaContact)}
              </Button>
            </div>
            <a href="#identity" className={styles.scroll} data-hero-in>
              <span>{t(copy.hero.scroll)}</span>
              <span className={styles.scrollTrack} aria-hidden="true">
                <span className={styles.scrollThumb} />
              </span>
            </a>
          </div>
        </div>
      </div>

      <figure className={styles.fig} data-hero-fade aria-hidden="true">
        <span className={styles.figTitle}>{t(copy.hero.figure)}</span>
        <span>{t(copy.hero.figureNote)}</span>
        <span className={styles.figHint}>↻ {t(copy.hero.drag)}</span>
      </figure>
    </section>
  );
}
