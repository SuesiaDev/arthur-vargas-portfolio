'use client';

import { useEffect, useRef } from 'react';
import { copy } from '@/data/copy';
import { sections } from '@/data/sections';
import { site } from '@/data/site';
import { appState, useApp } from '@/lib/app-state';
import { useLang } from '@/lib/i18n';
import { lockScroll, unlockScroll } from '@/lib/scroll';
import { StatusDot } from '@/components/ui/StatusDot';
import styles from './MobileMenu.module.css';

export function MobileMenu() {
  const { t } = useLang();
  const open = useApp((s) => s.menuOpen);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const first = ref.current?.querySelector<HTMLElement>('a');
    first?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') appState.set({ menuOpen: false });
    };
    window.addEventListener('keydown', onKey);
    return () => {
      unlockScroll();
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Close if the viewport grows into the desktop layout.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mq.matches && appState.set({ menuOpen: false });
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const close = () => appState.set({ menuOpen: false });

  return (
    <div
      ref={ref}
      id="mobile-menu"
      className={styles.menu}
      data-open={open}
      role="dialog"
      aria-modal="true"
      aria-label={t(copy.nav.primary)}
      inert={!open}
    >
      <div className={`container ${styles.inner}`}>
        <p className={styles.kicker}>
          <span>{site.system.name}</span>
          <span>Index</span>
        </p>
        <ul className={styles.list}>
          {sections.map((s, i) => (
            <li key={s.id} style={{ '--i': i } as React.CSSProperties}>
              <a href={`#${s.id}`} className={styles.link} onClick={close}>
                <span className={styles.index} aria-hidden="true">
                  {s.index}
                </span>
                <span className={styles.label}>{t(s.nav)}</span>
                <span className={styles.module} aria-hidden="true">
                  {s.module}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.footer}>
          <span className={styles.status}>
            <StatusDot />
            {t(copy.hero.status)}
          </span>
          <a href={`mailto:${site.email}`} className={styles.email}>
            {site.email}
          </a>
        </div>
      </div>
    </div>
  );
}
