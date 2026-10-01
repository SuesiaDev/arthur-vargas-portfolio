'use client';

import { useEffect } from 'react';
import { copy } from '@/data/copy';
import { useApp } from '@/lib/app-state';
import { ScrollTrigger } from '@/lib/gsap';
import { LangProvider, useLang } from '@/lib/i18n';
import { SmoothScroll } from '@/lib/smooth-scroll';
import { createCoreTriggers } from '@/animations/core-choreography';
import { createSectionTracking } from '@/animations/section-tracking';
import { BootSequence } from '@/components/boot/BootSequence';
import { Cursor } from '@/components/cursor/Cursor';
import { Atmosphere } from '@/components/layout/Atmosphere';
import { Nav } from '@/components/layout/Nav';
import { SectionIndicator } from '@/components/layout/SectionIndicator';
import { CaseView } from '@/components/case/CaseView';
import { Terminal } from '@/components/terminal/Terminal';
import { NetworkCore } from '@/components/three/NetworkCore';
import { bindCaseHistory, openCase } from '@/lib/case-transition';
import { Capabilities } from '@/sections/capabilities/Capabilities';
import { Connection } from '@/sections/connection/Connection';
import { Hero } from '@/sections/hero/Hero';
import { Identity } from '@/sections/identity/Identity';
import { Trajectory } from '@/sections/trajectory/Trajectory';
import { Work } from '@/sections/work/Work';

function Orchestrator({ initialCase }: { initialCase?: string }) {
  const { lang } = useLang();
  const booted = useApp((s) => s.booted);

  useEffect(() => bindCaseHistory(), []);

  // Deep link (/work/<slug>): open the case once the interface is up.
  useEffect(() => {
    if (booted && initialCase) openCase(initialCase, { push: false });
  }, [booted, initialCase]);

  // Global scroll-linked systems. Created after the sections so pinned
  // sections are measured first (see refreshPriority in each module).
  useEffect(() => {
    const killCore = createCoreTriggers();
    const killTracking = createSectionTracking();
    return () => {
      killCore();
      killTracking();
    };
  }, []);

  // Layout can shift after fonts load, the boot ends or the language changes.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [lang, booted]);

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return null;
}

function SkipLink() {
  const { t } = useLang();
  return (
    <a href="#main" className="skip-link">
      {t(copy.meta.skip)}
    </a>
  );
}

export function Experience({ initialCase }: { initialCase?: string }) {
  return (
    <LangProvider>
      <SkipLink />
      <SmoothScroll />
      <BootSequence />
      <NetworkCore />
      <Atmosphere />
      <Nav />
      <SectionIndicator />
      <main id="main">
        <Hero />
        <Identity />
        <Capabilities />
        <Work />
        <Trajectory />
        <Connection />
      </main>
      <Terminal />
      <CaseView />
      <Cursor />
      <Orchestrator initialCase={initialCase} />
    </LangProvider>
  );
}
