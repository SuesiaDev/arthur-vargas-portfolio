import * as THREE from 'three';

/**
 * NETWORK CORE — geometry
 *
 * Five stacked layers (systems → design) crossed by one vertical security
 * axis: defence in depth, drawn as an exploded infrastructure diagram.
 *
 * Every vertex stores its layer index; the vertical position is resolved in
 * the vertex shader as (layer - 2) * uSpread + yOffset, so the whole stack can
 * fold into a single plane (the boot line) or explode apart with one uniform.
 */

export const LAYER_COUNT = 5;
export const HALF = 1.7;
export const GRID_STEP = 0.34;
export const LAYER_LABELS = ['L1 · SYSTEMS', 'L2 · NETWORK', 'L3 · DEVELOPMENT', 'L4 · AI', 'L5 · DESIGN'];
export const AXIS_LABEL = 'SECURITY · CROSS-LAYER';
export const AXIS_EXTENT = 0.42;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class VertexBuffer {
  pos: number[] = [];
  layer: number[] = [];
  yoff: number[] = [];
  alpha: number[] = [];
  size: number[] = [];

  push(x: number, z: number, layer: number, alpha: number, yoff = 0, size = 1) {
    this.pos.push(x, 0, z);
    this.layer.push(layer);
    this.yoff.push(yoff);
    this.alpha.push(alpha);
    this.size.push(size);
  }

  segment(ax: number, az: number, bx: number, bz: number, layer: number, alpha: number) {
    this.push(ax, az, layer, alpha);
    this.push(bx, bz, layer, alpha);
  }

  toGeometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('aLayer', new THREE.Float32BufferAttribute(this.layer, 1));
    g.setAttribute('aYOffset', new THREE.Float32BufferAttribute(this.yoff, 1));
    g.setAttribute('aAlpha', new THREE.Float32BufferAttribute(this.alpha, 1));
    g.setAttribute('aSize', new THREE.Float32BufferAttribute(this.size, 1));
    return g;
  }
}

interface Packet {
  a: [number, number, number, number]; // x, z, layer, yoff
  b: [number, number, number, number];
  speed: number;
  phase: number;
  size: number;
}

function roundedRect(buf: VertexBuffer, half: number, r: number, layer: number, alpha: number) {
  const pts: [number, number][] = [];
  const corners: [number, number, number][] = [
    [half - r, half - r, 0],
    [-half + r, half - r, Math.PI / 2],
    [-half + r, -half + r, Math.PI],
    [half - r, -half + r, (3 * Math.PI) / 2],
  ];
  for (const [cx, cz, start] of corners) {
    for (let i = 0; i <= 6; i++) {
      const a = start + (i / 6) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
    }
  }
  for (let i = 0; i < pts.length; i++) {
    const [ax, az] = pts[i];
    const [bx, bz] = pts[(i + 1) % pts.length];
    buf.segment(ax, az, bx, bz, layer, alpha);
  }
}

function cornerTicks(buf: VertexBuffer, half: number, layer: number, alpha: number) {
  const o = half + 0.12;
  const len = 0.2;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      buf.segment(sx * o, sz * o, sx * (o - len), sz * o, layer, alpha);
      buf.segment(sx * o, sz * o, sx * o, sz * (o - len), layer, alpha);
    }
  }
}

function ruler(buf: VertexBuffer, half: number, layer: number, alpha: number) {
  const z = half + 0.12;
  for (let x = -half + 0.2, i = 0; x <= half - 0.2 + 1e-6; x += GRID_STEP / 2, i++) {
    const len = i % 2 === 0 ? 0.07 : 0.035;
    buf.segment(x, z, x, z + len, layer, alpha);
  }
}

function circle(buf: VertexBuffer, x: number, z: number, r: number, layer: number, alpha: number, seg = 28) {
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2;
    const a1 = ((i + 1) / seg) * Math.PI * 2;
    buf.segment(x + Math.cos(a0) * r, z + Math.sin(a0) * r, x + Math.cos(a1) * r, z + Math.sin(a1) * r, layer, alpha);
  }
}

export interface NetworkGeometry {
  frames: THREE.BufferGeometry;
  edges: THREE.BufferGeometry;
  axis: THREE.BufferGeometry;
  grid: THREE.BufferGeometry;
  nodes: THREE.BufferGeometry;
  axisNodes: THREE.BufferGeometry;
  fills: THREE.BufferGeometry;
  packets: THREE.BufferGeometry;
  dispose: () => void;
}

export function buildNetwork({ lite = false }: { lite?: boolean } = {}): NetworkGeometry {
  const rand = mulberry32(2026);
  const frames = new VertexBuffer();
  const edges = new VertexBuffer();
  const axis = new VertexBuffer();
  const grid = new VertexBuffer();
  const nodes = new VertexBuffer();
  const axisNodes = new VertexBuffer();
  const packets: Packet[] = [];

  const snap = (v: number) => Math.round(v / GRID_STEP) * GRID_STEP;
  const gridMax = GRID_STEP * 4; // 1.36
  const layerNodes: [number, number][][] = [];

  /** L-shaped (orthogonal) route, like a trace on a circuit board. */
  const route = (ax: number, az: number, bx: number, bz: number, layer: number, alpha: number) => {
    const xFirst = rand() > 0.5;
    const cx = xFirst ? bx : ax;
    const cz = xFirst ? az : bz;
    const segs: [number, number, number, number][] = [
      [ax, az, cx, cz],
      [cx, cz, bx, bz],
    ];
    for (const [x0, z0, x1, z1] of segs) {
      if (Math.hypot(x1 - x0, z1 - z0) < 1e-4) continue;
      edges.segment(x0, z0, x1, z1, layer, alpha);
      if (rand() < (lite ? 0.25 : 0.45)) {
        const forward = rand() > 0.5;
        packets.push({
          a: forward ? [x0, z0, layer, 0] : [x1, z1, layer, 0],
          b: forward ? [x1, z1, layer, 0] : [x0, z0, layer, 0],
          speed: 0.22 + rand() * 0.3,
          phase: rand(),
          size: 0.8,
        });
      }
    }
  };

  for (let i = 0; i < LAYER_COUNT; i++) {
    // Structure
    roundedRect(frames, HALF, 0.16, i, 0.34);
    cornerTicks(frames, HALF, i, 0.5);
    if (i === LAYER_COUNT - 1 || i === 0) ruler(frames, HALF, i, 0.32);

    // Grid of dots — the "substrate"
    for (let gx = -gridMax; gx <= gridMax + 1e-6; gx += GRID_STEP) {
      for (let gz = -gridMax; gz <= gridMax + 1e-6; gz += GRID_STEP) {
        grid.push(gx, gz, i, 0.2, 0, 0.7);
      }
    }

    // Nodes — snapped to the grid, kept apart from each other and the axis
    const pts: [number, number][] = [[0, 0]];
    const target = lite ? 5 : 7;
    let guard = 0;
    while (pts.length < target + 1 && guard++ < 400) {
      const x = snap((rand() * 2 - 1) * gridMax);
      const z = snap((rand() * 2 - 1) * gridMax);
      if (pts.every(([px, pz]) => Math.hypot(px - x, pz - z) >= 0.66)) pts.push([x, z]);
    }
    layerNodes.push(pts);

    for (let n = 1; n < pts.length; n++) {
      const [x, z] = pts[n];
      nodes.push(x, z, i, 0.95, 0, 1.6 + rand() * 1.1);
    }
    axisNodes.push(0, 0, i, 1, 0, 3.2);
    circle(axis, 0, 0, 0.17, i, 0.55);

    // Routes — each node links to its nearest neighbour (sometimes two)
    for (let n = 1; n < pts.length; n++) {
      const [x, z] = pts[n];
      const ranked = pts
        .map((p, idx) => ({ idx, d: Math.hypot(p[0] - x, p[1] - z) }))
        .filter((r) => r.idx !== n)
        .sort((a, b) => a.d - b.d);
      route(x, z, pts[ranked[0].idx][0], pts[ranked[0].idx][1], i, 0.42);
      if (rand() < 0.45 && ranked[1]) route(x, z, pts[ranked[1].idx][0], pts[ranked[1].idx][1], i, 0.26);
    }
  }

  // Vias — vertical links between adjacent layers, landing on a pad
  for (let i = 0; i < LAYER_COUNT - 1; i++) {
    const from = layerNodes[i].slice(1);
    const count = lite ? 1 : 2;
    for (let k = 0; k < count && from.length; k++) {
      const [x, z] = from.splice(Math.floor(rand() * from.length), 1)[0];
      edges.push(x, z, i, 0.5);
      edges.push(x, z, i + 1, 0.5);
      nodes.push(x, z, i + 1, 0.6, 0, 1.2);
      const up = rand() > 0.5;
      packets.push({
        a: up ? [x, z, i, 0] : [x, z, i + 1, 0],
        b: up ? [x, z, i + 1, 0] : [x, z, i, 0],
        speed: 0.35 + rand() * 0.25,
        phase: rand(),
        size: 1,
      });
      // connect the pad into the next layer's network
      const next = layerNodes[i + 1];
      const nearest = next
        .map((p) => ({ p, d: Math.hypot(p[0] - x, p[1] - z) }))
        .sort((a, b) => a.d - b.d)[0];
      if (nearest && nearest.d > 1e-3) route(x, z, nearest.p[0], nearest.p[1], i + 1, 0.3);
    }
  }

  // Security axis — one continuous line through every layer
  axis.push(0, 0, 0, 0.9, -AXIS_EXTENT);
  axis.push(0, 0, LAYER_COUNT - 1, 0.9, AXIS_EXTENT);
  for (let k = 0; k < (lite ? 2 : 4); k++) {
    packets.push({
      a: [0, 0, 0, -AXIS_EXTENT],
      b: [0, 0, LAYER_COUNT - 1, AXIS_EXTENT],
      speed: 0.12 + rand() * 0.06,
      phase: k / 4 + rand() * 0.1,
      size: 1.5,
    });
  }

  // Translucent fills — one quad per layer
  const fillPos: number[] = [];
  const fillLayer: number[] = [];
  const fillUv: number[] = [];
  const quad: [number, number, number, number][] = [
    [-HALF, -HALF, 0, 0],
    [HALF, -HALF, 1, 0],
    [HALF, HALF, 1, 1],
    [-HALF, -HALF, 0, 0],
    [HALF, HALF, 1, 1],
    [-HALF, HALF, 0, 1],
  ];
  for (let i = 0; i < LAYER_COUNT; i++) {
    for (const [x, z, u, v] of quad) {
      fillPos.push(x, 0, z);
      fillLayer.push(i);
      fillUv.push(u, v);
    }
  }
  const fills = new THREE.BufferGeometry();
  fills.setAttribute('position', new THREE.Float32BufferAttribute(fillPos, 3));
  fills.setAttribute('aLayer', new THREE.Float32BufferAttribute(fillLayer, 1));
  fills.setAttribute('uv', new THREE.Float32BufferAttribute(fillUv, 2));

  // Packets — positions resolved on the GPU from start/end + time
  const pk = new THREE.BufferGeometry();
  const pStart: number[] = [];
  const pEnd: number[] = [];
  const pMeta: number[] = [];
  const pDummy: number[] = [];
  for (const p of packets) {
    pStart.push(...p.a);
    pEnd.push(...p.b);
    pMeta.push(p.speed, p.phase, p.size);
    pDummy.push(0, 0, 0);
  }
  pk.setAttribute('position', new THREE.Float32BufferAttribute(pDummy, 3));
  pk.setAttribute('aStart', new THREE.Float32BufferAttribute(pStart, 4));
  pk.setAttribute('aEnd', new THREE.Float32BufferAttribute(pEnd, 4));
  pk.setAttribute('aMeta', new THREE.Float32BufferAttribute(pMeta, 3));

  const out = {
    frames: frames.toGeometry(),
    edges: edges.toGeometry(),
    axis: axis.toGeometry(),
    grid: grid.toGeometry(),
    nodes: nodes.toGeometry(),
    axisNodes: axisNodes.toGeometry(),
    fills,
    packets: pk,
  };

  return {
    ...out,
    dispose: () => Object.values(out).forEach((g) => g.dispose()),
  };
}
