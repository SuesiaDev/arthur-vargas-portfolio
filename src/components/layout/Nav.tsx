'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { copy } from '@/data/copy';
import { sections } from '@/data/sections';
import { site } from '@/data/site';
import { appState, useApp } from '@/lib/app-state';
import { useLang } from '@/lib/i18n';
import { useLocalTime } from '@/hooks/useLocalTime';
import { StatusDot } from '@/components/ui/StatusDot';
import { LangToggle } from './LangToggle';
import { MobileMenu } from './MobileMenu';
import styles from './Nav.module.css';

export function Nav() {
  const { t } = useLang();
  const ref = useRef<HTMLElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const active = useApp((s) => s.section);
  const menuOpen = useApp((s) => s.menuOpen);
  const time = useLocalTime(site.location.timeZone, false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ref.current?.setAttribute('data-scrolled', String(y > 24));
      progress.current?.style.setProperty('--p', String(max > 0 ? y / max : 0));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <header ref={ref} className={styles.nav} data-scrolled="false" data-nav>
        <div className={`container ${styles.inner}`}>
          <a href="#top" className={styles.brand} aria-label={t(copy.nav.home)}>
            <span className={styles.mark}>
              <Image src="/images/arthur.webp" alt="" width={64} height={64} priority className={styles.avatar} />
            </span>
            <span className={styles.brandName}>
              {site.shortName}
              <span className={styles.brandRole}>/ Security · Dev</span>
            </span>
          </a>

          <nav className={styles.links} aria-label={t(copy.nav.primary)}>
            <ul>
              {sections
                .filter((s) => s.inNav)
                .map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={styles.link}
                      aria-current={active === s.id ? 'true' : undefined}
                    >
                      <span className={styles.linkIndex} aria-hidden="true">
                        {s.index}
                      </span>
                      <span className="ulink">{t(s.nav)}</span>
                    </a>
                  </li>
                ))}
            </ul>
          </nav>

          <div className={styles.meta}>
            <span className={styles.status}>
              <StatusDot />
              <span>{t(copy.nav.online)}</span>
              <span className={styles.time} suppressHydrationWarning>
                {time && `${time} BRT`}
              </span>
            </span>
            <LangToggle />
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => appState.set({ menuOpen: !menuOpen })}
            >
              <span className={styles.menuLabel}>{menuOpen ? t(copy.nav.close) : t(copy.nav.menu)}</span>
              <span className={styles.burger} data-open={menuOpen} aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
        <span ref={progress} className={styles.progress} aria-hidden="true" />
      </header>
      <MobileMenu />
    </>
  );
}
