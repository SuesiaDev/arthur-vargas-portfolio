'use client';

import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { gsap } from '@/lib/gsap';
import { scene, type Formation } from '@/lib/scene-state';
import { useApp } from '@/lib/app-state';
import { computeTarget } from '@/animations/core-choreography';
import { CoreScene } from './CoreScene';
import styles from './NetworkCanvas.module.css';

const KEYS: (keyof Formation)[] = ['x', 'y', 'scale', 'spread', 'tilt', 'turn', 'opacity', 'energy'];

/** The site must never break because a GPU or driver refuses WebGL. */
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Exposes R3F's invalidate() to the GSAP ticker for on-demand rendering. */
function InvalidateBridge({ onReady }: { onReady: (fn: () => void) => void }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => onReady(invalidate), [invalidate, onReady]);
  return null;
}

export default function NetworkCanvas() {
  const wrap = useRef<HTMLDivElement>(null);
  const invalidateRef = useRef<() => void>(() => {});
  const [visible, setVisible] = useState(true);
  const [env] = useState(() => ({
    webgl: supportsWebGL(),
    lite: window.matchMedia('(max-width: 767px)').matches,
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }));
  const caseOpen = useApp((s) => s.caseSlug !== null);

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 767px)');
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      scene.isMobile = mqMobile.matches;
      scene.reducedMotion = mqReduce.matches;
    };
    sync();
    mqMobile.addEventListener('change', sync);
    mqReduce.addEventListener('change', sync);

    const target = { ...scene.formation };
    let on = true;
    let lastOpacity = -1;

    const tick = (_time: number, deltaMs: number) => {
      computeTarget(target, scene.isMobile);
      const f = scene.formation;
      const k = scene.reducedMotion ? 1 : 1 - Math.exp(-(deltaMs / 1000) * 3);
      let moved = 0;
      for (const key of KEYS) {
        const d = target[key] - f[key];
        f[key] += d * k;
        moved += Math.abs(d);
      }
      const o = Math.round(f.opacity * 1000) / 1000;
      if (o !== lastOpacity && wrap.current) {
        wrap.current.style.opacity = String(o);
        lastOpacity = o;
      }
      const shouldRun = f.opacity > 0.01;
      if (shouldRun !== on) {
        on = shouldRun;
        setVisible(shouldRun);
      }
      if (scene.reducedMotion && moved > 1e-4) invalidateRef.current();
    };
    gsap.ticker.add(tick);

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scene.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', onPointer);
      mqMobile.removeEventListener('change', sync);
      mqReduce.removeEventListener('change', sync);
    };
  }, []);

  if (!env.webgl) return null;

  const frameloop = !visible || caseOpen ? 'never' : env.reduced ? 'demand' : 'always';

  return (
    <div ref={wrap} className={styles.wrap} aria-hidden="true">
      <div className={styles.fade}>
        <WebGLBoundary>
          <Canvas
            className={styles.canvas}
            frameloop={frameloop}
            dpr={env.lite ? [1, 1.5] : [1, 1.75]}
            flat
            gl={{ antialias: !env.lite, alpha: true, powerPreference: 'high-performance', stencil: false, depth: false }}
            camera={{ fov: 30, position: [0, 0, 15], near: 1, far: 40 }}
          >
            <InvalidateBridge onReady={(fn) => (invalidateRef.current = fn)} />
            <CoreScene lite={env.lite} />
          </Canvas>
        </WebGLBoundary>
      </div>
    </div>
  );
}
