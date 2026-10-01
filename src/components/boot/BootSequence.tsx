'use client';

import { useRef, useState } from 'react';
import { site } from '@/data/site';
import { appState } from '@/lib/app-state';
import { gsap } from '@/lib/gsap';
import { lockScroll, unlockScroll } from '@/lib/scroll';
import { choreo } from '@/animations/core-choreography';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import styles from './BootSequence.module.css';

const LOG = [
  ['System boot', 'OK'],
  ['Initializing interface', 'OK'],
  ['Loading profile', 'OK'],
  ['Security layer', 'Active'],
  ['Network', 'Online'],
] as const;

const SESSION_KEY = 'av.booted';
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function stamp() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: site.location.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}.${get('month')}.${get('day')} · ${get('hour')}:${get('minute')}:${get('second')} BRT`;
}

/**
 * BOOT — the opening sequence (~2.8s, ~1s on repeat visits in a session).
 * Hands over to the hero by opening an aperture along the progress line;
 * the line itself travels down and becomes the hero's baseline rule.
 */
export function BootSequence() {
  const root = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (clock.current) clock.current.textContent = stamp();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = false;
    try {
      seen = Boolean(sessionStorage.getItem(SESSION_KEY));
    } catch {
      /* private mode */
    }

    const finish = () => {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
      setDone(true);
    };

    if (reduced) {
      choreo.intro = 1;
      appState.set({ booted: true });
      finish();
      return;
    }

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (!window.location.pathname.startsWith('/work/')) window.scrollTo(0, 0);
    lockScroll();
    let unlocked = false;
    const release = () => {
      if (unlocked) return;
      unlocked = true;
      unlockScroll();
    };

    let completed = false;
    const ctx = gsap.context(() => {
    const q = gsap.utils.selector(el);
    const line = q(`.${styles.line}`)[0] as HTMLElement;
    const counter = q(`.${styles.counterValue}`)[0] as HTMLElement;
    const halves = q(`.${styles.half}`);
    const count = { v: 0 };

    const toRule = () => {
      const rule = document.querySelector<HTMLElement>('[data-hero-rule]');
      if (!rule) return 0;
      return rule.getBoundingClientRect().top - line.getBoundingClientRect().top;
    };

    const tl = gsap.timeline({
      onComplete: () => {
        completed = true;
        document.querySelector<HTMLElement>('[data-hero-rule]')?.style.setProperty('opacity', '1');
        finish();
      },
    });

    const fast = seen;
    const fill = fast ? 0.55 : 1.7;

    tl.from(q(`.${styles.corner}`), { opacity: 0, y: 6, duration: 0.5, stagger: 0.06, ease: 'av-soft' }, 0)
      .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: fill, ease: 'power2.inOut' }, 0.08)
      .to(
        count,
        {
          v: 100,
          duration: fill,
          ease: 'power2.inOut',
          onUpdate: () => {
            counter.textContent = String(Math.round(count.v)).padStart(3, '0');
          },
        },
        0.08,
      );

    if (!fast) {
      q(`.${styles.row}`).forEach((row, i) => {
        const status = row.querySelector(`.${styles.status}`) as HTMLElement;
        const at = 0.18 + i * 0.27;
        tl.from(row, { opacity: 0, x: -10, duration: 0.4, ease: 'av-out' }, at).fromTo(
          status,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            scrambleText: { text: status.dataset.text ?? '', chars: GLYPHS, speed: 1 },
          },
          at + 0.16,
        );
      });
      tl.from(q(`.${styles.granted}`), { opacity: 0, y: 8, duration: 0.5, stagger: 0.08 }, 1.72);
    }

    const open = fast ? 0.6 : 2.05;
    tl.add(() => {
      appState.set({ booted: true });
      release();
    }, open + 0.1)
      .to(choreo, { intro: 1, duration: 2, ease: 'av-in-out' }, open)
      .to(q(`.${styles.content}`), { opacity: 0, filter: 'blur(4px)', duration: 0.35, ease: 'av-soft' }, open - 0.1)
      .to(halves[0], { yPercent: -101, duration: 1.15, ease: 'av-in-out' }, open)
      .to(halves[1], { yPercent: 101, duration: 1.15, ease: 'av-in-out' }, open)
      .to(q(`.${styles.marker}`), { opacity: 0, duration: 0.3 }, open)
      .to(line, { y: toRule, duration: 1.1, ease: 'av-in-out' }, open + 0.3);
    }, el);

    return () => {
      // Once complete, keep the end state (the 3D intro must stay at 1).
      if (completed) ctx.kill();
      else ctx.revert();
      release();
    };
  }, []);

  if (done) return null;

  return (
    <div ref={root} className={styles.boot} aria-hidden="true">
      <div className={styles.half}>
        <div className={`container ${styles.halfInner}`}>
          <div className={styles.topRow}>
            <span className={styles.corner}>
              {site.system.name} <span className={styles.dim}>v{site.system.version}</span>
            </span>
            <span ref={clock} className={styles.corner} />
          </div>
          <div className={`${styles.content} ${styles.log}`}>
            {LOG.map(([label, status], i) => (
              <div key={label} className={styles.row}>
                <span className={styles.rowIndex}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.rowLabel}>{label}</span>
                <span className={styles.leader} />
                <span className={styles.status} data-text={status}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.half}>
        <div className={`container ${styles.halfInner}`}>
          <div className={`${styles.content} ${styles.identity}`}>
            <span className={styles.granted}>
              <span className={styles.grantedDot} /> Access granted
            </span>
            <span className={`${styles.granted} ${styles.name}`}>Arthur Vargas</span>
          </div>
          <div className={`${styles.content} ${styles.counter}`}>
            <span className={styles.counterValue}>000</span>
            <span className={styles.counterUnit}>%</span>
          </div>
          <div className={styles.bottomRow}>
            <span className={styles.corner}>Session {site.system.session}</span>
            <span className={styles.corner}>{site.location.coords}</span>
          </div>
        </div>
      </div>

      <div className={`container ${styles.lineWrap}`}>
        <span className={styles.line} />
        <span className={styles.marker} />
      </div>
    </div>
  );
}
