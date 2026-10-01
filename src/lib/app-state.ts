'use client';

import type { SectionId } from '@/data/types';
import { createStore, useStore } from './store';

interface AppState {
  /** Boot sequence finished and the interface is interactive. */
  booted: boolean;
  /** Slug of the case file currently open, if any. */
  caseSlug: string | null;
  terminalOpen: boolean;
  menuOpen: boolean;
  section: SectionId;
}

export const appState = createStore<AppState>({
  booted: false,
  caseSlug: null,
  terminalOpen: false,
  menuOpen: false,
  section: 'top',
});

export const useApp = <S,>(selector: (s: AppState) => S) => useStore(appState, selector);
