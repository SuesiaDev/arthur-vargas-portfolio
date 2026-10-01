'use client';

import dynamic from 'next/dynamic';

/**
 * Code-split entry for the WebGL scene: three.js + R3F load in their own
 * chunk, in parallel with the boot sequence, and never on the server.
 */
const NetworkCanvas = dynamic(() => import('./NetworkCanvas'), { ssr: false, loading: () => null });

export function NetworkCore() {
  return <NetworkCanvas />;
}
