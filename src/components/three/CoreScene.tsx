'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { scene } from '@/lib/scene-state';
import { AXIS_EXTENT, AXIS_LABEL, HALF, LAYER_LABELS, buildNetwork } from './geometry';
import { createMaterials, createSharedUniforms, writeUniforms } from './materials';

/** Renders a mono label into a texture once fonts are ready. */
function makeLabel(text: string, opts: { width: number; color: string; align?: CanvasTextAlign }) {
  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = opts.width * scale;
  canvas.height = 48 * scale;
  const ctx = canvas.getContext('2d')!;
  const family = getComputedStyle(document.body).getPropertyValue('--font-mono') || 'monospace';
  ctx.scale(scale, scale);
  ctx.font = `500 22px ${family}`;
  ctx.fillStyle = opts.color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = opts.align ?? 'left';
  // letter-spacing via canvas API where supported
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '3px';
  ctx.fillText(text, opts.align === 'center' ? opts.width / 2 : 4, 24);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function CoreScene({ lite }: { lite: boolean }) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const labels = useRef<THREE.Mesh[]>([]);
  const axisLabel = useRef<THREE.Sprite>(null);
  const { gl, invalidate } = useThree();

  const net = useMemo(() => buildNetwork({ lite }), [lite]);
  const shared = useMemo(() => createSharedUniforms(gl.getPixelRatio()), [gl]);
  const mats = useMemo(() => createMaterials(shared), [shared]);

  const objects = useMemo(() => {
    const frames = new THREE.LineSegments(net.frames, mats.frame);
    const edges = new THREE.LineSegments(net.edges, mats.edge);
    const axis = new THREE.LineSegments(net.axis, mats.axis);
    const grid = new THREE.Points(net.grid, mats.grid);
    const nodes = new THREE.Points(net.nodes, mats.node);
    const axisNodes = new THREE.Points(net.axisNodes, mats.axisNode);
    const fills = new THREE.Mesh(net.fills, mats.fill);
    const packets = new THREE.Points(net.packets, mats.packet);
    const all = [fills, frames, grid, edges, axis, nodes, axisNodes, packets];
    // Vertical positions are resolved in the shader — bounding volumes are meaningless.
    all.forEach((o, i) => {
      o.frustumCulled = false;
      o.renderOrder = i;
    });
    return all;
  }, [net, mats]);

  // Labels (textures need the web font)
  useEffect(() => {
    let cancelled = false;
    const created: THREE.Texture[] = [];
    document.fonts.ready.then(() => {
      if (cancelled || !inner.current) return;
      LAYER_LABELS.forEach((text, i) => {
        const tex = makeLabel(text, { width: 320, color: 'rgba(196,214,232,0.82)' });
        created.push(tex);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.24), mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(-HALF + 0.82, 0, HALF + 0.42);
        mesh.renderOrder = 20;
        mesh.frustumCulled = false;
        inner.current!.add(mesh);
        labels.current[i] = mesh;
      });
      const tex = makeLabel(AXIS_LABEL, { width: 420, color: 'rgba(159,230,238,0.9)', align: 'center' });
      created.push(tex);
      if (axisLabel.current) {
        (axisLabel.current.material as THREE.SpriteMaterial).map = tex;
        (axisLabel.current.material as THREE.SpriteMaterial).needsUpdate = true;
        axisLabel.current.visible = true;
      }
      invalidate();
    });
    const innerGroup = inner.current;
    return () => {
      cancelled = true;
      labels.current.forEach((m) => {
        innerGroup?.remove(m);
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      labels.current = [];
      created.forEach((t) => t.dispose());
    };
  }, [invalidate]);

  useEffect(() => {
    scene.ready = true;
    return () => {
      scene.ready = false;
      net.dispose();
      Object.values(mats).forEach((m) => m.dispose());
    };
  }, [net, mats]);

  // Smoothed, frame-rate independent secondary motion
  const sm = useRef({ px: 0, py: 0, excite: 0, auto: 0, clock: 0, time: 0 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const f = scene.formation;
    const s = sm.current;
    const reduce = scene.reducedMotion;
    const k = (rate: number) => 1 - Math.exp(-dt * rate);

    s.px += (scene.pointer.x - s.px) * k(2.4);
    s.py += (scene.pointer.y - s.py) * k(2.4);
    s.excite += (scene.excite - s.excite) * k(3.5);

    const drag = scene.drag;
    if (!drag.active) {
      drag.angle += drag.velocity * dt;
      drag.velocity *= Math.exp(-dt * 2.4);
    }
    if (!reduce) {
      // A slow sway around the composed angle — never a perpetual spin.
      s.clock += dt;
      s.auto = Math.sin(s.clock * 0.11) * 0.3;
      s.time += dt * (0.35 + f.energy * 0.65 + s.excite * 0.8);
    }

    const aspect = state.size.width / Math.max(1, state.size.height);
    const fit = scene.isMobile ? 1 : Math.min(1, aspect / 1.55);

    if (outer.current && inner.current) {
      outer.current.position.set(f.x * fit, f.y, 0);
      outer.current.scale.setScalar(f.scale * (scene.isMobile ? 1 : Math.max(0.8, fit)));
      outer.current.rotation.x = f.tilt + s.py * 0.07;
      inner.current.rotation.y = f.turn + s.auto + drag.angle + s.px * 0.2;
    }

    const spread = f.spread + s.excite * 0.1;
    writeUniforms(shared, spread, s.time, Math.min(1.4, f.energy * (0.8 + s.excite * 0.6)));

    // Labels only read when the structure is the focus (not as a dimmed backdrop).
    const legible = THREE.MathUtils.smoothstep(f.opacity, 0.45, 0.9);
    labels.current.forEach((m, i) => {
      if (!m) return;
      m.position.y = (i - 2) * spread + 0.002;
      (m.material as THREE.MeshBasicMaterial).opacity = legible;
    });
    if (axisLabel.current) {
      axisLabel.current.position.y = 2 * spread + AXIS_EXTENT + 0.22;
      const mat = axisLabel.current.material as THREE.SpriteMaterial;
      mat.opacity = THREE.MathUtils.smoothstep(spread, 0.18, 0.4) * 0.9 * legible;
    }
  });

  return (
    <group ref={outer}>
      <group ref={inner}>
        {objects.map((o) => (
          <primitive key={o.uuid} object={o} />
        ))}
        <sprite ref={axisLabel} scale={[1.75, 0.2, 1]} visible={false} renderOrder={21}>
          <spriteMaterial transparent depthWrite={false} depthTest={false} opacity={0} />
        </sprite>
      </group>
    </group>
  );
}
