'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { copy } from '@/data/copy';
import { getProject, projects } from '@/data/projects';
import { useApp } from '@/lib/app-state';
import { closeCase, openCase } from '@/lib/case-transition';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useLang } from '@/lib/i18n';
import { lockScroll, unlockScroll } from '@/lib/scroll';
import { ProjectArt } from './ProjectArt';
import styles from './CaseView.module.css';

export function CaseView() {
  const { t, lang } = useLang();
  const slug = useApp((s) => s.caseSlug);
  const project = slug ? getProject(slug) : undefined;
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const isOpen = Boolean(project);

  // Lock the page, manage focus, close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    lockScroll();
    closeBtn.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeCase();
      }
      if (e.key === 'Tab' && root.current) {
        // Keep focus inside the dialog.
        const focusables = root.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      unlockScroll();
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  // Content reveals inside the overlay's own scroller.
  useEffect(() => {
    if (!project || !scroller.current) return;
    scroller.current.scrollTop = 0;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-case-in]', { y: 28, opacity: 0, duration: 1, stagger: 0.07, ease: 'av-out', delay: 0.35 });
      gsap.utils.toArray<HTMLElement>('[data-case-block]').forEach((block) => {
        gsap.from(block.querySelectorAll('[data-block-in]'), {
          y: 36,
          opacity: 0,
          duration: 1,
          stagger: 0.08,
          ease: 'av-out',
          scrollTrigger: { trigger: block, scroller: scroller.current, start: 'top 85%', once: true },
        });
      });
    }, scroller);
    return () => ctx.revert();
  }, [project, lang]);

  useEffect(() => {
    if (isOpen) ScrollTrigger.refresh();
  }, [isOpen]);

  if (!project) return null;

  const i = projects.findIndex((p) => p.slug === project.slug);
  const shots = project.case.screenshots;
  const realShots = shots.length > 0 && shots.every((s) => s.src);
  const next = projects[(i + 1) % projects.length];
  const c = copy.case;
  const blocks = [
    { id: 'challenge', label: c.challenge, text: project.case.challenge },
    { id: 'solution', label: c.solution, text: project.case.solution },
  ];

  return (
    <div
      ref={root}
      className={styles.case}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-title"
      style={{ viewTransitionName: 'case-shell' }}
    >
      <div ref={scroller} className={styles.scroller} data-lenis-prevent>
        <header className={styles.bar}>
          <div className={`container ${styles.barInner}`}>
            <button type="button" className={styles.back} onClick={() => closeCase()}>
              <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
              <span className="ulink">{t(c.back)}</span>
            </button>
            <span className={styles.barMeta} aria-hidden="true">
              Case {project.index} / {String(projects.length).padStart(2, '0')} · {project.client}
            </span>
            <button
              ref={closeBtn}
              type="button"
              className={styles.close}
              onClick={() => closeCase()}
              aria-label={t(c.close)}
            >
              <span className={styles.esc}>Esc</span>
              <X size={16} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className={styles.cover} data-case-hero style={{ viewTransitionName: 'case-cover' }}>
          {project.cover ? (
            <Image src={project.cover} alt="" fill priority sizes="100vw" className={styles.coverImg} />
          ) : (
            <ProjectArt project={project} />
          )}
        </div>

        <div className="container">
          <div className={styles.intro}>
            <div className={styles.heading}>
              <span className={styles.index} data-case-in>
                {project.index}
              </span>
              <h2 id="case-title" className={styles.title} data-case-in>
                {project.client}
              </h2>
              <p className={styles.subtitle} data-case-in>
                {t(project.title)}
              </p>
            </div>
            <dl className={styles.facts} data-case-in>
              <div>
                <dt>{t(c.client)}</dt>
                <dd>{project.client}</dd>
              </div>
              <div>
                <dt>{t(c.type)}</dt>
                <dd>{t(project.type)}</dd>
              </div>
              <div>
                <dt>{t(c.role)}</dt>
                <dd>{t(project.role)}</dd>
              </div>
              {project.year && (
                <div>
                  <dt>{t(c.year)}</dt>
                  <dd>{project.year}</dd>
                </div>
              )}
              <div>
                <dt>Scope</dt>
                <dd>{project.tags.map((tag) => t(tag)).join(' · ')}</dd>
              </div>
            </dl>
          </div>

          <p className={styles.summary} data-case-in>
            {t(project.summary)}
          </p>

          {blocks.map((b, n) => (
            <section key={b.id} className={styles.block} data-case-block>
              <h3 className={styles.blockLabel} data-block-in>
                <span>{String(n + 1).padStart(2, '0')}</span> {t(b.label)}
              </h3>
              <p className={styles.blockText} data-block-in>
                {t(b.text)}
              </p>
            </section>
          ))}

          <section className={styles.block} data-case-block>
            <h3 className={styles.blockLabel} data-block-in>
              <span>03</span> {t(c.process)}
            </h3>
            <ol className={styles.process}>
              {project.case.process.map((step, n) => (
                <li key={n} className={styles.step} data-block-in>
                  <span className={styles.stepIndex}>{String(n + 1).padStart(2, '0')}</span>
                  <span className={styles.stepNode} aria-hidden="true" />
                  <strong className={styles.stepTitle}>{t(step.title)}</strong>
                  <span className={styles.stepText}>{t(step.text)}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className={`${styles.block} ${styles.split}`} data-case-block>
            <div>
              <h3 className={styles.blockLabel} data-block-in>
                <span>04</span> {t(c.stack)}
              </h3>
              <ul className={styles.list} data-block-in>
                {project.case.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={styles.blockLabel} data-block-in>
                <span>05</span> {t(c.deliverables)}
              </h3>
              <ul className={styles.list} data-block-in>
                {project.case.deliverables.map((d) => (
                  <li key={d.en}>{t(d)}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className={styles.block} data-case-block>
            <h3 className={styles.blockLabel} data-block-in>
              <span>06</span> {t(c.screens)}
            </h3>
            {realShots ? (
              // Real screenshots share one row height: each item grows by its aspect ratio.
              <div className={styles.galleryReal}>
                {shots.map((shot, n) => (
                  <figure
                    key={n}
                    className={styles.shotReal}
                    data-device={shot.device}
                    data-block-in
                    style={{ '--ar': (shot.width ?? 16) / (shot.height ?? 10) } as React.CSSProperties}
                  >
                    <div className={styles.shotRealFrame}>
                      <Image
                        src={shot.src!}
                        alt={t(shot.alt)}
                        width={shot.width ?? 1600}
                        height={shot.height ?? 1000}
                        sizes={shot.device === 'mobile' ? '(min-width: 1024px) 22vw, 80vw' : '(min-width: 1024px) 75vw, 100vw'}
                        className={styles.shotImg}
                      />
                    </div>
                    <figcaption>{t(shot.caption)}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className={styles.gallery}>
                {shots.map((shot, n) => (
                  <figure key={n} className={styles.shot} data-device={shot.device} data-block-in>
                    <div className={styles.shotFrame}>
                      {shot.src ? (
                        <Image src={shot.src} alt={t(shot.alt)} fill sizes="(min-width: 1024px) 50vw, 100vw" />
                      ) : (
                        <ProjectArt project={project} variant={shot.device} seed={n} />
                      )}
                    </div>
                    <figcaption>{t(shot.caption)}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>

          <section className={styles.block} data-case-block>
            <h3 className={styles.blockLabel} data-block-in>
              <span>07</span> {t(c.outcome)}
            </h3>
            <dl className={styles.results}>
              {project.case.results.map((r) => (
                <div key={r.label.en} data-block-in>
                  <dt>{t(r.label)}</dt>
                  <dd>{t(r.value)}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.links} data-block-in>
              {project.links.live ? (
                <a href={project.links.live} target="_blank" rel="noopener noreferrer" className={styles.linkPrimary}>
                  {t(c.visit)} <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                </a>
              ) : (
                <span className={styles.linkMuted}>{t(c.soon)}</span>
              )}
              {project.links.github && (
                <a href={project.links.github} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {t(c.github)} <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                </a>
              )}
            </div>
          </section>
        </div>

        {next && next.slug !== project.slug && (
          <a
            href={`/work/${next.slug}`}
            className={styles.next}
            data-cursor="view"
            data-cursor-label={t(c.next)}
            onClick={(e) => {
              e.preventDefault();
              openCase(next.slug);
            }}
          >
            <span className="container">
              <span className={styles.nextLabel}>
                {t(c.next)} · {next.index}
              </span>
              <span className={styles.nextTitle}>
                {next.client}
                <ArrowRight className={styles.nextArrow} strokeWidth={1} aria-hidden="true" />
              </span>
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
