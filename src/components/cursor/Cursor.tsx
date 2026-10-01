'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import styles from './Cursor.module.css';

type Mode = 'default' | 'link' | 'view' | 'explore' | 'drag' | 'text' | 'hidden';

const LABELS: Partial<Record<Mode, string>> = { view: 'View', explore: 'Explore', drag: 'Drag' };

/**
 * Discreet custom cursor (fine pointers only).
 * Any element can request a mode with data-cursor="link|view|explore|drag|text"
 * and an optional data-cursor-label. Links and buttons default to "link".
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches || !root.current) return;

    const html = document.documentElement;
    html.classList.add('has-cursor');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3.out' });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3.out' });
    const rx = gsap.quickTo(ring.current, 'x', { duration: reduce ? 0.05 : 0.42, ease: 'power3.out' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: reduce ? 0.05 : 0.42, ease: 'power3.out' });

    let mode: Mode = 'default';
    let visible = false;

    const setMode = (next: Mode, text?: string) => {
      const labelText = text ?? LABELS[next] ?? '';
      if (next === mode && label.current?.textContent === labelText) return;
      mode = next;
      root.current!.dataset.mode = next;
      if (label.current) label.current.textContent = labelText;
    };

    const resolve = (target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;
      const tagged = el?.closest<HTMLElement>('[data-cursor]');
      if (tagged) return setMode(tagged.dataset.cursor as Mode, tagged.dataset.cursorLabel);
      if (el?.closest('input, textarea, [contenteditable="true"]')) return setMode('text');
      if (el?.closest('a, button, [role="button"], [role="tab"], label, summary')) return setMode('link');
      setMode('default');
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (!visible) {
        visible = true;
        root.current!.dataset.visible = 'true';
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const onOver = (e: PointerEvent) => resolve(e.target);
    const onLeave = () => {
      visible = false;
      root.current!.dataset.visible = 'false';
    };
    const onDown = () => (root.current!.dataset.pressed = 'true');
    const onUp = () => (root.current!.dataset.pressed = 'false');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });

    return () => {
      html.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div ref={root} className={styles.root} data-mode="default" data-visible="false" aria-hidden="true">
      <div ref={ring} className={styles.ring}>
        <div className={styles.ringShape}>
          <span ref={label} className={styles.label} />
        </div>
      </div>
      <div ref={dot} className={styles.dot} />
    </div>
  );
}
