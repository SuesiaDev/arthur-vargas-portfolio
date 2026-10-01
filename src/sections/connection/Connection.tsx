'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, Check, Copy, Download, Mail } from 'lucide-react';
import { copy } from '@/data/copy';
import { site } from '@/data/site';
import { appState } from '@/lib/app-state';
import { gsap, SplitText } from '@/lib/gsap';
import { Icon } from '@/lib/icons';
import { useLang } from '@/lib/i18n';
import { useGsap } from '@/hooks/useGsap';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Scramble } from '@/components/ui/Scramble';
import { StatusDot } from '@/components/ui/StatusDot';
import styles from './Connection.module.css';

function useSessionClock() {
  const [elapsed, setElapsed] = useState('00:00:00');
  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => {
      const s = Math.floor((performance.now() - start) / 1000);
      const hh = String(Math.floor(s / 3600)).padStart(2, '0');
      const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      setElapsed(`${hh}:${mm}:${ss}`);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);
  return elapsed;
}

export function Connection() {
  const { t, lang } = useLang();
  const c = copy.contact;
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const session = useSessionClock();

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      // Clipboard API unavailable (http, permissions): fall back to a hidden selection.
      const input = document.createElement('textarea');
      input.value = site.email;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const scope = useGsap<HTMLElement>(
    ({ reduced }, el) => {
      if (reduced) return;
      const headline = el.querySelectorAll(`.${styles.headLine}`);
      const split = SplitText.create(headline, { type: 'chars', charsClass: styles.char, tag: 'span' });
      gsap.from(split.chars, {
        yPercent: 110,
        duration: 1.2,
        stagger: 0.025,
        ease: 'av-out',
        scrollTrigger: { trigger: el.querySelector(`.${styles.headline}`), start: 'top 80%', once: true },
      });
      gsap.from(el.querySelectorAll('[data-in]'), {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.07,
        ease: 'av-out',
        scrollTrigger: { trigger: el.querySelector(`.${styles.body}`), start: 'top 85%', once: true },
      });
      gsap.from(el.querySelector(`.${styles.endRule}`), {
        scaleX: 0,
        duration: 1.6,
        ease: 'av-in-out',
        scrollTrigger: { trigger: el.querySelector(`.${styles.end}`), start: 'top 95%', once: true },
      });
      return () => split.revert();
    },
    [lang],
  );

  const links = [
    { key: 'github', icon: 'github' as const, ...site.links.github },
    { key: 'linkedin', icon: 'linkedin' as const, ...site.links.linkedin },
  ];

  return (
    <section ref={scope} id="contact" className={styles.contact} aria-labelledby="contact-title">
      <div className="container">
        <ModuleHeader index="05" module="Connection" meta="Port 443 · Open" />

        <h2 id="contact-title" className={styles.headline} key={lang}>
          {c.headline.map((line, i) => (
            <span key={i} className={`${styles.headLine} ${i === 1 ? styles.headLine2 : ''}`}>
              {t(line)}
            </span>
          ))}
        </h2>

        <div className={styles.body}>
          <div className={styles.left}>
            <p className={styles.text} data-in>
              {t(c.text)}
            </p>
            <p className={styles.status} data-in>
              <StatusDot />
              {t(copy.hero.status)}
            </p>
          </div>

          <ul className={styles.channels}>
            <li className={styles.channel} data-in>
              <span className={styles.channelLabel}>
                <Mail size={14} strokeWidth={1.5} aria-hidden="true" />
                {t(c.email)}
              </span>
              <a href={`mailto:${site.email}`} className={styles.channelValue}>
                {site.email}
              </a>
              <span className={styles.actions}>
                <button type="button" className={styles.action} onClick={copyEmail} data-done={copied}>
                  {copied ? <Check size={13} strokeWidth={1.75} aria-hidden="true" /> : <Copy size={13} strokeWidth={1.5} aria-hidden="true" />}
                  {copied ? <Scramble text={t(c.copied)} trigger="mount" duration={0.5} /> : t(c.copy)}
                </button>
              </span>
              <span className={styles.sweep} aria-hidden="true" />
            </li>

            {links.map((l) => (
              <li key={l.key} className={styles.channel} data-in data-disabled={!l.url}>
                <span className={styles.channelLabel}>
                  <Icon name={l.icon} size={14} />
                  {l.label}
                </span>
                {l.url ? (
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className={styles.channelValue}>
                    {l.handle || l.url.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                ) : (
                  <span className={`${styles.channelValue} ${styles.muted}`}>{t(c.soon)}</span>
                )}
                {l.url && (
                  <span className={styles.actions}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className={styles.action} aria-label={`${t(c.open)} ${l.label}`}>
                      {t(c.open)} <ArrowUpRight size={13} strokeWidth={1.5} aria-hidden="true" />
                    </a>
                  </span>
                )}
                <span className={styles.sweep} aria-hidden="true" />
              </li>
            ))}

            <li className={styles.channel} data-in>
              <span className={styles.channelLabel}>
                <Download size={14} strokeWidth={1.5} aria-hidden="true" />
                {t(c.cv)}
              </span>
              <a href={site.cv.href} download={site.cv.fileName} className={styles.channelValue}>
                {site.name}
                <span className={styles.channelMeta}>{t(c.cvValue)}</span>
              </a>
              <span className={styles.actions}>
                <a href={site.cv.href} download={site.cv.fileName} className={`${styles.action} ${styles.actionPrimary}`}>
                  {t(c.download)} <Download size={13} strokeWidth={1.5} aria-hidden="true" />
                </a>
              </span>
              <span className={styles.sweep} aria-hidden="true" />
            </li>
          </ul>
        </div>
        <p className="sr-only" aria-live="polite">
          {copied ? t(c.copied) : ''}
        </p>
      </div>

      <footer className={styles.end} data-end>
        <div className="container">
          <span className={styles.endRule} data-end-rule aria-hidden="true" />
          <div className={styles.endRow}>
            <p className={styles.endSignal}>
              <span className={styles.endTitle}>End of transmission</span>
              <span className={styles.endOpen}>
                <StatusDot />
                Connection open · System ready
              </span>
            </p>
            <p className={styles.endMeta} aria-hidden="true">
              <span>
                {t(c.session)} {site.system.session}
              </span>
              <span suppressHydrationWarning>{session}</span>
            </p>
            <a href="#top" className={styles.top}>
              <span className="ulink">{t(c.backToTop)}</span>
              <ArrowUp size={14} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </div>
          <div className={styles.endRow2}>
            <span suppressHydrationWarning>
              © {new Date().getFullYear()} {site.name}
            </span>
            <button type="button" className={styles.terminalHint} onClick={() => appState.set({ terminalOpen: true })}>
              <kbd>`</kbd> Terminal
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}
