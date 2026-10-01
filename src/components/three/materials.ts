import * as THREE from 'three';

/**
 * Shared uniforms: one write per frame updates every material.
 * uSpread folds/unfolds the stack; depth fade gives a sense of volume
 * without real lights or post-processing.
 */
export function createSharedUniforms(pixelRatio: number) {
  return {
    uSpread: { value: 0 },
    uTime: { value: 0 },
    uEnergy: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uFogNear: { value: 13.2 },
    uFogFar: { value: 17.6 },
  };
}

export type SharedUniforms = ReturnType<typeof createSharedUniforms>;

/** Per-frame write of the shared uniforms (three.js objects are mutable by design). */
export function writeUniforms(u: SharedUniforms, spread: number, time: number, energy: number) {
  u.uSpread.value = spread;
  u.uTime.value = time;
  u.uEnergy.value = energy;
}

const layerY = /* glsl */ `
  uniform float uSpread;
  attribute float aLayer;
  attribute float aYOffset;
  vec3 layered(vec3 p) {
    p.y += (aLayer - 2.0) * uSpread + aYOffset;
    return p;
  }
`;

const depthFade = /* glsl */ `
  uniform float uFogNear;
  uniform float uFogFar;
  float depthFade(float depth) {
    return mix(1.0, 0.28, smoothstep(uFogNear, uFogFar, depth));
  }
`;

const lineVertex = /* glsl */ `
  ${layerY}
  attribute float aAlpha;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(layered(position), 1.0);
    vAlpha = aAlpha;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const lineFragment = /* glsl */ `
  ${depthFade}
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    gl_FragColor = vec4(uColor, vAlpha * uOpacity * depthFade(vDepth));
    #include <colorspace_fragment>
  }
`;

const pointVertex = /* glsl */ `
  ${layerY}
  uniform float uPixelRatio;
  uniform float uPointScale;
  attribute float aAlpha;
  attribute float aSize;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(layered(position), 1.0);
    vAlpha = aAlpha;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPointScale * uPixelRatio * (15.0 / -mv.z);
  }
`;

const pointFragment = /* glsl */ `
  ${depthFade}
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float a = pow(core, 1.8) * vAlpha * uOpacity * depthFade(vDepth);
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`;

const fillVertex = /* glsl */ `
  ${layerY.replace('attribute float aYOffset;', '').replace(' + aYOffset', '')}
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(layered(position), 1.0);
    vUv = uv;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fillFragment = /* glsl */ `
  ${depthFade}
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vec2 c = vUv * 2.0 - 1.0;
    float edge = max(abs(c.x), abs(c.y));
    float a = (0.05 + 0.05 * smoothstep(0.55, 1.0, edge)) * (1.0 - smoothstep(0.98, 1.0, edge));
    gl_FragColor = vec4(uColor, a * uOpacity * depthFade(vDepth));
    #include <colorspace_fragment>
  }
`;

const packetVertex = /* glsl */ `
  uniform float uSpread;
  uniform float uTime;
  uniform float uEnergy;
  uniform float uPixelRatio;
  attribute vec4 aStart;
  attribute vec4 aEnd;
  attribute vec3 aMeta; // speed, phase, size
  varying float vAlpha;
  varying float vDepth;
  vec3 resolve(vec4 p) {
    return vec3(p.x, (p.z - 2.0) * uSpread + p.w, p.y);
  }
  void main() {
    float t = fract(uTime * aMeta.x + aMeta.y);
    vec3 p = mix(resolve(aStart), resolve(aEnd), t);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vAlpha = sin(t * 3.14159) * uEnergy;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aMeta.z * 5.5 * uPixelRatio * (15.0 / -mv.z);
  }
`;

function base(params: THREE.ShaderMaterialParameters) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    ...params,
  });
}

export function createMaterials(shared: SharedUniforms) {
  const color = (hex: string) => ({ value: new THREE.Color(hex) });

  return {
    frame: base({
      uniforms: { ...shared, uColor: color('#c4d6e8'), uOpacity: { value: 0.55 } },
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
    }),
    edge: base({
      uniforms: { ...shared, uColor: color('#9cc8f2'), uOpacity: { value: 0.75 } },
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
    }),
    axis: base({
      uniforms: { ...shared, uColor: color('#74d0dc'), uOpacity: { value: 0.9 } },
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
    }),
    grid: base({
      uniforms: { ...shared, uColor: color('#c4d6e8'), uOpacity: { value: 0.9 }, uPointScale: { value: 2.2 } },
      vertexShader: pointVertex,
      fragmentShader: pointFragment,
    }),
    node: base({
      uniforms: { ...shared, uColor: color('#dcebfb'), uOpacity: { value: 1 }, uPointScale: { value: 4.2 } },
      vertexShader: pointVertex,
      fragmentShader: pointFragment,
    }),
    axisNode: base({
      uniforms: { ...shared, uColor: color('#9fe6ee'), uOpacity: { value: 1 }, uPointScale: { value: 4.2 } },
      vertexShader: pointVertex,
      fragmentShader: pointFragment,
    }),
    fill: base({
      uniforms: { ...shared, uColor: color('#7fa9d4'), uOpacity: { value: 1 } },
      vertexShader: fillVertex,
      fragmentShader: fillFragment,
      side: THREE.DoubleSide,
    }),
    packet: base({
      uniforms: { ...shared, uColor: color('#e6f6ff'), uOpacity: { value: 1 } },
      vertexShader: packetVertex,
      fragmentShader: pointFragment,
    }),
  };
}

export type CoreMaterials = ReturnType<typeof createMaterials>;
