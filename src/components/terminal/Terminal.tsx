'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SquareTerminal, X } from 'lucide-react';
import { copy } from '@/data/copy';
import { site } from '@/data/site';
import { appState, useApp } from '@/lib/app-state';
import { openCase } from '@/lib/case-transition';
import { useLang } from '@/lib/i18n';
import { lockScroll, scrollToTarget, unlockScroll } from '@/lib/scroll';
import { commandNames, runCommand, type Line } from './commands';
import styles from './Terminal.module.css';

const PROMPT = 'arthur@av-system:~$';

export function Terminal() {
  const { t, lang, setLang } = useLang();
  const open = useApp((s) => s.terminalOpen);
  const booted = useApp((s) => s.booted);
  const caseOpen = useApp((s) => s.caseSlug !== null);
  // The trigger steps aside where the layout already has bottom-corner content.
  const hidden = useApp((s) => s.section === 'contact' || s.section === 'top');
  const [lines, setLines] = useState<Line[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => appState.set({ terminalOpen: false }), []);

  // Welcome message — derived, so it follows the language until cleared.
  const welcome: Line[] = showWelcome
    ? [
        { kind: 'title', text: `${site.system.name} ${site.system.version} · ${site.system.session}` },
        { kind: 'muted', text: t(copy.terminal.welcome) },
        { kind: 'out', text: '' },
      ]
    : [];

  // Global shortcut: ` toggles, Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.closest('input, textarea, [contenteditable="true"]') && el !== input.current;
      if (e.key === '`' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        appState.set((s) => ({ terminalOpen: !s.terminalOpen }));
      }
      if (e.key === 'Escape' && appState.get().terminalOpen) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  useEffect(() => {
    if (!open) {
      if (document.activeElement === input.current) trigger.current?.focus({ preventScroll: true });
      return;
    }
    const id = window.setTimeout(() => input.current?.focus({ preventScroll: true }), 60);
    // On small screens the terminal is a sheet: freeze the page beneath it.
    const sheet = window.matchMedia('(max-width: 767px)').matches;
    if (sheet) lockScroll();
    return () => {
      window.clearTimeout(id);
      if (sheet) unlockScroll();
    };
  }, [open]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [lines]);

  const submit = async (raw: string) => {
    const cmd = raw.trim();
    const echo: Line = { kind: 'input', text: `${PROMPT} ${raw}` };
    if (!cmd) {
      setLines((l) => [...l, echo]);
      return;
    }
    const nextHistory = [...history, cmd].slice(-50);
    setHistory(nextHistory);
    setCursor(-1);
    let cleared = false;
    const result = await runCommand(cmd, {
      lang,
      setLang,
      history: nextHistory,
      goto: (sectionId) => scrollToTarget(`#${sectionId}`),
      openCase,
      copyEmail: async () => {
        try {
          await navigator.clipboard.writeText(site.email);
        } catch {
          /* clipboard blocked — the address is printed anyway */
        }
      },
      downloadCv: () => {
        const a = document.createElement('a');
        a.href = site.cv.href;
        a.download = site.cv.fileName;
        a.click();
      },
      clear: () => {
        cleared = true;
      },
      close,
    });
    if (cleared) {
      setShowWelcome(false);
      setLines([]);
      return;
    }
    setLines((l) => [...l, echo, ...result, ...(result.length ? [{ kind: 'out' as const, text: '' }] : [])]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void submit(value);
      setValue('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const next = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setValue(history[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cursor < 0) return;
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(-1);
        setValue('');
      } else {
        setCursor(next);
        setValue(history[next]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const match = commandNames.filter((n) => n.startsWith(value.trim().toLowerCase()) && value.trim());
      if (match.length === 1) setValue(match[0] + ' ');
      else if (match.length > 1) setLines((l) => [...l, { kind: 'muted', text: match.join('  ') }]);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setShowWelcome(false);
      setLines([]);
    }
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        data-visible={booted && !open && !caseOpen && !hidden}
        onClick={() => appState.set({ terminalOpen: true })}
        aria-label={t(copy.terminal.open)}
        aria-expanded={open}
        aria-controls="terminal"
      >
        <SquareTerminal size={14} strokeWidth={1.5} aria-hidden="true" />
        <span>Terminal</span>
        <kbd aria-hidden="true">`</kbd>
      </button>

      <div
        id="terminal"
        className={styles.panel}
        data-open={open}
        role="dialog"
        aria-label={t(copy.terminal.label)}
        inert={!open}
        onClick={() => input.current?.focus()}
      >
        <div className={styles.head}>
          <span className={styles.headTitle}>
            <span className={styles.headDot} aria-hidden="true" />
            Command interface
          </span>
          <span className={styles.headMeta} aria-hidden="true">
            zsh · {lang.toUpperCase()}
          </span>
          <button type="button" className={styles.close} onClick={close} aria-label={t(copy.terminal.close)}>
            <span aria-hidden="true">Esc</span>
            <X size={13} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <div ref={log} className={styles.log} role="log" aria-live="polite" data-lenis-prevent>
          {[...welcome, ...lines].map((line, i) => (
            <p key={i} className={styles.line} data-kind={line.kind}>
              {line.text || ' '}
            </p>
          ))}
          <div className={styles.inputRow}>
            <label htmlFor="terminal-input" className={styles.prompt}>
              {PROMPT}
            </label>
            <input
              ref={input}
              id="terminal-input"
              className={styles.input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label={t(copy.terminal.input)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
