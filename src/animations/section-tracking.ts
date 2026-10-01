'use client';

import { sections } from '@/data/sections';
import { appState } from '@/lib/app-state';
import { ScrollTrigger } from '@/lib/gsap';

/** Keeps `appState.section` in sync with the section crossing the viewport centre. */
export function createSectionTracking() {
  const triggers = sections.map((s) =>
    ScrollTrigger.create({
      trigger: `#${s.id}`,
      start: 'top 55%',
      end: 'bottom 55%',
      refreshPriority: -20,
      onToggle: (self) => {
        if (self.isActive) appState.set({ section: s.id });
      },
    }),
  );
  return () => triggers.forEach((t) => t.kill());
}
