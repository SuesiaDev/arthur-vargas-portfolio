'use client';

import { copy } from '@/data/copy';
import { skillCategories, type SkillCategory } from '@/data/skills';
import { ScrollTrigger } from '@/lib/gsap';
import { Icon } from '@/lib/icons';
import { useLang } from '@/lib/i18n';
import { useGsap } from '@/hooks/useGsap';
import styles from './SkillNetworkMobile.module.css';

function MiniGraph({ category }: { category: SkillCategory }) {
  const n = category.skills.length;
  const r = n > 6 ? 118 : 92;
  return (
    <svg viewBox="-175 -160 350 320" className={styles.graph} aria-hidden="true">
      <circle r={r} className={styles.orbit} />
      {category.skills.map((s, i) => {
        const a = -90 + (i * 360) / n;
        return (
          <line
            key={s.id}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
            className={styles.spoke}
            style={{ '--a': `${a}deg`, '--r': String(r), '--i': i } as React.CSSProperties}
          />
        );
      })}
      {category.skills.map((s, i) => {
        const a = -90 + (i * 360) / n;
        return (
          <g
            key={s.id}
            className={styles.sat}
            style={{ '--a': `${a}deg`, '--r': `${r}px`, '--i': i } as React.CSSProperties}
          >
            <circle r="17" className={styles.satBg} />
            <Icon name={s.icon} size={16} x={-8} y={-8} strokeWidth={1.4} className={styles.satIcon} />
          </g>
        );
      })}
      <circle r="34" className={styles.hubRing} />
      <circle r="28" className={styles.hubFill} />
      <text y="-1" textAnchor="middle" className={styles.hubCode}>
        {category.code}
      </text>
      <text y="14" textAnchor="middle" className={styles.hubIndex}>
        {category.index}
      </text>
    </svg>
  );
}

export function SkillNetworkMobile() {
  const { t } = useLang();
  const c = copy.capabilities;

  const scope = useGsap<HTMLDivElement>((_env, el) => {
    el.querySelectorAll<HTMLElement>(`.${styles.cat}`).forEach((cat) => {
      ScrollTrigger.create({
        trigger: cat,
        start: 'top 78%',
        once: true,
        onEnter: () => (cat.dataset.on = 'true'),
      });
    });
  });

  return (
    <div ref={scope} className={styles.mobile}>
      <h2 className={styles.title}>{t(c.title)}</h2>
      <p className={styles.intro}>{t(c.intro)}</p>

      {skillCategories.map((cat) => (
        <article key={cat.id} className={styles.cat} data-on="false" aria-labelledby={`m-${cat.id}`}>
          <header className={styles.head}>
            <span className={styles.index}>{cat.index}</span>
            <h3 id={`m-${cat.id}`} className={styles.name}>
              {t(cat.name)}
            </h3>
            <span className={styles.count}>
              {String(cat.skills.length).padStart(2, '0')} {t(c.nodes)}
            </span>
          </header>
          <MiniGraph category={cat} />
          <p className={styles.description}>{t(cat.description)}</p>
          <ul className={styles.list}>
            {cat.skills.map((s) => (
              <li key={s.id} className={styles.item}>
                <span className={styles.itemIcon} aria-hidden="true">
                  <Icon name={s.icon} size={14} />
                </span>
                <span className={styles.itemName}>{t(s.name)}</span>
                <span className={styles.itemNote}>{t(s.note)}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
