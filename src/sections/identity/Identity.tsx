'use client';

import { copy } from '@/data/copy';
import { site } from '@/data/site';
import { gsap, SplitText } from '@/lib/gsap';
import { useLang } from '@/lib/i18n';
import { useGsap } from '@/hooks/useGsap';
import { useLocalTime } from '@/hooks/useLocalTime';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Scramble } from '@/components/ui/Scramble';
import { StatusDot } from '@/components/ui/StatusDot';
import styles from './Identity.module.css';

export function Identity() {
  const { t, lang } = useLang();
  const time = useLocalTime(site.location.timeZone, false);
  const c = copy.identity;

  const scope = useGsap<HTMLElement>(
    ({ reduced }, el) => {
      if (reduced) return;

      // Statement: words light up as the reader scrolls through them.
      const statement = el.querySelector(`.${styles.statement}`);
      const split = SplitText.create(statement, { type: 'words', wordsClass: styles.word });
      gsap.fromTo(
        split.words,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: statement, start: 'top 78%', end: 'bottom 52%', scrub: 0.6 },
        },
      );

      gsap.from(el.querySelectorAll(`.${styles.specRow}`), {
        opacity: 0,
        x: -12,
        duration: 0.7,
        stagger: 0.06,
        ease: 'av-out',
        scrollTrigger: { trigger: el.querySelector(`.${styles.spec}`), start: 'top 82%', once: true },
      });

      gsap.from(el.querySelectorAll(`.${styles.bodyText}`), {
        opacity: 0,
        y: 24,
        duration: 1,
        stagger: 0.12,
        ease: 'av-out',
        scrollTrigger: { trigger: el.querySelector(`.${styles.body}`), start: 'top 85%', once: true },
      });

      el.querySelectorAll(`.${styles.principle}`).forEach((item, i) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 88%', once: true } });
        tl.from(item.querySelector(`.${styles.principleRule}`), { scaleX: 0, duration: 1.1, ease: 'av-in-out' }, i * 0.08).from(
          item.querySelectorAll(`.${styles.principleIndex}, .${styles.principleTitle}, .${styles.principleText}`),
          { opacity: 0, y: 16, duration: 0.9, stagger: 0.07, ease: 'av-out' },
          0.25 + i * 0.08,
        );
      });

      return () => split.revert();
    },
    [lang],
  );

  return (
    <section ref={scope} id="identity" className={styles.identity} aria-labelledby="identity-title">
      <div className="container">
        <ModuleHeader index="01" module={t(c.title)} meta="REC. AV-0001 · Verified" />
        <h2 id="identity-title" className="sr-only">
          {t(copy.identity.title)}
        </h2>

        <div className={styles.layout}>
          <aside className={styles.spec} aria-label={t(c.spec.record)}>
            <div className={styles.specHead}>
              <span>ID · AV-0001</span>
              <span className={styles.live}>
                <StatusDot />
                Live
              </span>
            </div>
            <dl className={styles.specList}>
              {c.spec.rows.map((row) => (
                <div key={row.key} className={styles.specRow}>
                  <dt>{row.key}</dt>
                  <dd>
                    {'live' in row && row.live && <StatusDot />}
                    <Scramble text={t(row.value)} />
                  </dd>
                </div>
              ))}
            </dl>
            <div className={styles.specFoot} aria-hidden="true">
              <span>Checksum · 9F2C-41AE-07D3</span>
              <span suppressHydrationWarning>Sync · {time} BRT</span>
            </div>
          </aside>

          <div className={styles.content}>
            <p key={lang} className={styles.statement}>
              {t(c.statement)}
            </p>

            <div className={styles.body}>
              {c.body.map((p, i) => (
                <p key={i} className={styles.bodyText}>
                  {t(p)}
                </p>
              ))}
            </div>

            <ol className={styles.principles}>
              {c.principles.map((p, i) => (
                <li key={i} className={styles.principle}>
                  <span className={styles.principleRule} aria-hidden="true" />
                  <span className={styles.principleIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <h3 className={styles.principleTitle}>{t(p.title)}</h3>
                  <p className={styles.principleText}>{t(p.text)}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
