'use client';

import { copy } from '@/data/copy';
import { useLang } from '@/lib/i18n';
import styles from './LangToggle.module.css';

export function LangToggle() {
  const { lang, setLang, t } = useLang();
  const next = lang === 'pt' ? 'en' : 'pt';

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => setLang(next)}
      aria-label={t(copy.meta.langSwitch)}
      data-lang={lang}
    >
      <span className={styles.opt} aria-hidden="true" data-active={lang === 'pt'}>
        PT
      </span>
      <span className={styles.sep} aria-hidden="true" />
      <span className={styles.opt} aria-hidden="true" data-active={lang === 'en'}>
        EN
      </span>
    </button>
  );
}
