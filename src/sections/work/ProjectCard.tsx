'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { copy } from '@/data/copy';
import type { Project } from '@/data/projects';
import { openCase } from '@/lib/case-transition';
import { useLang } from '@/lib/i18n';
import { ProjectArt } from '@/components/case/ProjectArt';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
  total: number;
}

export function ProjectCard({ project, total }: ProjectCardProps) {
  const { t } = useLang();
  const visual = useRef<HTMLDivElement>(null);
  const coord = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);

  // Crosshair + spotlight follow the pointer (CSS variables, one write per frame).
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !visual.current) return;
    const r = visual.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      visual.current?.style.setProperty('--mx', x.toFixed(4));
      visual.current?.style.setProperty('--my', y.toFixed(4));
      if (coord.current) coord.current.textContent = `X ${x.toFixed(2)} · Y ${y.toFixed(2)}`;
    });
  };

  const open = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    openCase(project.slug);
  };

  const label = `${t(copy.work.viewCase)}: ${project.client}, ${t(project.title)}`;

  return (
    <article className={styles.card} data-project-card>
      <a
        href={`/work/${project.slug}`}
        className={styles.visualLink}
        onClick={open}
        aria-label={label}
        data-cursor="view"
        data-cursor-label={t(copy.work.viewCase)}
      >
        <div ref={visual} className={styles.visual} data-case-cover={project.slug} onPointerMove={onMove}>
          <div className={styles.media} data-parallax>
            {project.cover ? (
              <Image src={project.cover} alt="" fill sizes="(min-width: 1024px) 66vw, 100vw" className={styles.img} />
            ) : (
              <ProjectArt project={project} />
            )}
          </div>
          <span className={styles.spot} aria-hidden="true" />
          <span className={styles.crossX} aria-hidden="true" />
          <span className={styles.crossY} aria-hidden="true" />
          <span ref={coord} className={styles.coord} aria-hidden="true">
            X 0.50 · Y 0.50
          </span>
          <span className={`${styles.corner} ${styles.tl}`} aria-hidden="true">
            Case {project.index} / {String(total).padStart(2, '0')}
          </span>
          <span className={`${styles.corner} ${styles.tr}`} aria-hidden="true">
            {t(project.type)}
          </span>
          <span className={`${styles.corner} ${styles.br}`} aria-hidden="true">
            {t(copy.work.viewCase)} <ArrowUpRight size={12} strokeWidth={1.5} />
          </span>
          <span className={styles.frame} aria-hidden="true" />
        </div>
      </a>

      <div className={styles.meta}>
        <span className={styles.index}>{project.index}</span>
        <div className={styles.heading}>
          <h3 className={styles.client}>{project.client}</h3>
          <p className={styles.title}>{t(project.title)}</p>
        </div>
        <ul className={styles.tags} aria-label="Tags">
          {project.tags.map((tag) => (
            <li key={tag.en}>{t(tag)}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
