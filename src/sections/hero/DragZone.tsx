'use client';

import { useRef } from 'react';
import { scene } from '@/lib/scene-state';
import styles from './Hero.module.css';

/**
 * Invisible hit area over the Network Core: drag to spin the structure.
 * Velocity is handed to the scene on release, which applies inertia.
 */
export function DragZone({ label }: { label: string }) {
  const last = useRef({ x: 0, t: 0 });

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    scene.drag.active = true;
    scene.drag.velocity = 0;
    last.current = { x: e.clientX, t: performance.now() };
    e.currentTarget.dataset.dragging = 'true';
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scene.drag.active) return;
    const now = performance.now();
    const dx = e.clientX - last.current.x;
    const dt = Math.max(1, now - last.current.t) / 1000;
    const delta = dx * 0.0085;
    scene.drag.angle += delta;
    scene.drag.velocity = scene.drag.velocity * 0.6 + (delta / dt) * 0.4;
    last.current = { x: e.clientX, t: now };
  };

  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    scene.drag.active = false;
    scene.drag.velocity = Math.max(-6, Math.min(6, scene.drag.velocity));
    e.currentTarget.dataset.dragging = 'false';
  };

  return (
    <div
      className={styles.dragZone}
      data-cursor="drag"
      data-cursor-label={label}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      aria-hidden="true"
    />
  );
}
