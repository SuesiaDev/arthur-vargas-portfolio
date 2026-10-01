'use client';

import { flushSync } from 'react-dom';
import { gsap } from './gsap';
import { appState } from './app-state';

/**
 * Case files open as an overlay on top of the page — no reload, scroll
 * position preserved — with a shared-element transition: the project cover
 * grows from its card into the case hero.
 *
 * Uses the View Transitions API where available, a GSAP FLIP otherwise, and a
 * plain swap under reduced motion. URLs stay shareable (/work/<slug>).
 */

const NAME = 'case-cover';
/** History entry created by openCase — closing it should go back, not replace. */
let pushedEntry = false;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsVT = () => typeof document !== 'undefined' && 'startViewTransition' in document;

function cardCover(slug: string) {
  return document.querySelector<HTMLElement>(`[data-case-cover="${slug}"]`);
}

function caseCover() {
  return document.querySelector<HTMLElement>('[data-case-hero]');
}

function inViewport(el: HTMLElement | null) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
}

function setUrl(slug: string | null, mode: 'push' | 'replace') {
  const url = slug ? `/work/${slug}` : '/';
  if (window.location.pathname === url) return;
  const state = { ...(history.state ?? {}), avCase: slug };
  if (mode === 'push') {
    history.pushState(state, '', url);
    pushedEntry = true;
  } else {
    history.replaceState(state, '', url);
  }
}

/** FLIP fallback: animate the case hero from the card's rectangle. */
function flipFrom(from: DOMRect) {
  const to = caseCover();
  if (!to) return;
  const r = to.getBoundingClientRect();
  gsap.fromTo(
    to,
    {
      x: from.left - r.left,
      y: from.top - r.top,
      scaleX: from.width / r.width,
      scaleY: from.height / r.height,
      transformOrigin: '0 0',
    },
    { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.95, ease: 'av-in-out', clearProps: 'transform' },
  );
}

export function openCase(slug: string, opts: { push?: boolean } = { push: true }) {
  if (appState.get().caseSlug === slug) return;
  if (opts.push !== false) setUrl(slug, appState.get().caseSlug ? 'replace' : 'push');

  const card = cardCover(slug);
  const shared = !reduced() && inViewport(card) && !appState.get().caseSlug;
  const commit = () => flushSync(() => appState.set({ caseSlug: slug, terminalOpen: false, menuOpen: false }));

  if (reduced()) {
    commit();
    return;
  }

  if (supportsVT()) {
    if (shared && card) card.style.viewTransitionName = NAME;
    const vt = document.startViewTransition(() => {
      if (card) card.style.viewTransitionName = '';
      commit();
    });
    vt.finished.finally(() => {
      if (card) card.style.viewTransitionName = '';
    });
    return;
  }

  const from = shared && card ? card.getBoundingClientRect() : null;
  commit();
  if (from) flipFrom(from);
}

/** Close the case view. Called by the UI and by history navigation. */
export function closeCase(opts: { fromHistory?: boolean } = {}) {
  const slug = appState.get().caseSlug;
  if (!slug) return;

  if (opts.fromHistory) {
    pushedEntry = false;
  } else if (pushedEntry) {
    // Going back restores the previous URL and fires popstate → closeCase({ fromHistory }).
    pushedEntry = false;
    history.back();
    return;
  } else {
    setUrl(null, 'replace');
  }

  const card = cardCover(slug);
  const commit = () => flushSync(() => appState.set({ caseSlug: null }));

  if (reduced() || !supportsVT()) {
    commit();
    return;
  }

  const hero = caseCover();
  const shared = inViewport(card) && hero && hero.getBoundingClientRect().bottom > 0;
  const vt = document.startViewTransition(() => {
    commit();
    if (shared && card) card.style.viewTransitionName = NAME;
  });
  vt.finished.finally(() => {
    if (card) card.style.viewTransitionName = '';
  });
}

/** Keep the overlay in sync with back/forward navigation. */
export function bindCaseHistory() {
  const onPop = () => {
    const match = window.location.pathname.match(/^\/work\/([^/]+)\/?$/);
    if (match) openCase(match[1], { push: false });
    else closeCase({ fromHistory: true });
  };
  window.addEventListener('popstate', onPop);
  return () => window.removeEventListener('popstate', onPop);
}
