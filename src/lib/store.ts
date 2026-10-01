'use client';

import { useSyncExternalStore } from 'react';

/**
 * Minimal external store. Enough for a handful of global UI flags without
 * pulling a state library into the bundle.
 */
export function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    get: () => state,
    set(partial: Partial<T> | ((s: T) => Partial<T>)) {
      const next = typeof partial === 'function' ? partial(state) : partial;
      let changed = false;
      for (const k in next) {
        if (!Object.is(state[k], next[k])) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = { ...state, ...next };
      listeners.forEach((l) => l());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    initial,
  };
}

type Store<T extends object> = ReturnType<typeof createStore<T>>;

export function useStore<T extends object, S>(store: Store<T>, selector: (s: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(store.initial),
  );
}
