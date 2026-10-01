import { copy } from '@/data/copy';
import { now, timeline } from '@/data/education';
import { projects } from '@/data/projects';
import { roleLine, site } from '@/data/site';
import { skillCategories } from '@/data/skills';
import type { L, Lang } from '@/data/types';

export type LineKind = 'input' | 'out' | 'muted' | 'accent' | 'ok' | 'error' | 'title';
export interface Line {
  kind: LineKind;
  text: string;
}

export interface TerminalContext {
  lang: Lang;
  setLang: (l: Lang) => void;
  goto: (id: string) => void;
  openCase: (slug: string) => void;
  copyEmail: () => Promise<void>;
  downloadCv: () => void;
  clear: () => void;
  close: () => void;
  history: string[];
}

type Result = Line[] | Promise<Line[]>;

interface Command {
  description: L;
  usage?: string;
  hidden?: boolean;
  run: (args: string[], ctx: TerminalContext) => Result;
}

const out = (text: string, kind: LineKind = 'out'): Line => ({ kind, text });
const blank = out('');
const tr = (l: L, lang: Lang) => l[lang];

const SECTIONS: Record<string, string> = {
  top: 'top',
  home: 'top',
  about: 'identity',
  identity: 'identity',
  skills: 'capabilities',
  capabilities: 'capabilities',
  work: 'work',
  projects: 'work',
  background: 'trajectory',
  education: 'trajectory',
  trajectory: 'trajectory',
  contact: 'contact',
};

const SECURITY_HEADERS = [
  'content-security-policy',
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
  'cross-origin-opener-policy',
];

export const commands: Record<string, Command> = {
  help: {
    description: { pt: 'Lista os comandos disponíveis', en: 'List available commands' },
    run: (_a, { lang }) => [
      out(lang === 'pt' ? 'Comandos disponíveis:' : 'Available commands:', 'title'),
      ...Object.entries(commands)
        .filter(([, c]) => !c.hidden)
        .map(([name, c]) => out(`  ${(c.usage ?? name).padEnd(18)} ${tr(c.description, lang)}`)),
      blank,
      out(lang === 'pt' ? 'Dica: ↑ ↓ histórico · Tab completa · Esc fecha' : 'Tip: ↑ ↓ history · Tab completes · Esc closes', 'muted'),
    ],
  },

  whoami: {
    description: { pt: 'Quem é Arthur', en: 'Who is Arthur' },
    run: (_a, { lang }) => [
      out(site.name, 'title'),
      out(lang === 'pt' ? 'Estudante de Segurança Cibernética' : 'Cybersecurity Student'),
      out(lang === 'pt' ? 'Desenvolvedor' : 'Developer'),
      out(lang === 'pt' ? 'Entusiasta de tecnologia' : 'Technology Enthusiast'),
      blank,
      out(`${site.location.region} / ${site.location.country} · ${tr(roleLine, lang)}`, 'muted'),
    ],
  },

  about: {
    description: { pt: 'Resumo profissional', en: 'Professional summary' },
    run: (_a, { lang }) => [
      out(tr(copy.identity.statement, lang)),
      blank,
      ...copy.identity.body.map((p) => out(tr(p, lang), 'muted')),
    ],
  },

  skills: {
    description: { pt: 'Habilidades por domínio', en: 'Skills by domain' },
    usage: 'skills [domain]',
    run: (args, { lang }) => {
      const q = args[0]?.toLowerCase();
      const cats = q
        ? skillCategories.filter(
            (c) => c.id.startsWith(q) || c.code.toLowerCase() === q || c.index === q.padStart(2, '0') || c.name.en.toLowerCase().startsWith(q),
          )
        : skillCategories;
      if (!cats.length) return [out(`skills: '${args[0]}' not found. Try: security, development, ai, tools`, 'error')];
      return cats.flatMap((c) => [
        out(`[${tr(c.name, lang).toUpperCase()}]`, 'accent'),
        out('  ' + c.skills.map((s) => tr(s.name, lang)).join(' · ')),
        blank,
      ]);
    },
  },

  projects: {
    description: { pt: 'Lista os cases', en: 'List case files' },
    run: (_a, { lang }) => [
      ...projects.map((p) => out(`  ${p.index}  ${p.client.padEnd(22)} ${tr(p.title, lang)}`)),
      blank,
      out(lang === 'pt' ? "Use 'open 01' para abrir um case." : "Use 'open 01' to open a case.", 'muted'),
    ],
  },

  open: {
    description: { pt: 'Abre um case', en: 'Open a case file' },
    usage: 'open <n>',
    run: (args, { lang, openCase, close }) => {
      const q = (args[0] ?? '').toLowerCase();
      const p = projects.find((x) => x.index === q.padStart(2, '0') || x.slug.startsWith(q));
      if (!q || !p) return [out(lang === 'pt' ? 'uso: open <número>' : 'usage: open <number>', 'error')];
      close();
      setTimeout(() => openCase(p.slug), 250);
      return [out(`→ ${p.client}`, 'ok')];
    },
  },

  education: {
    description: { pt: 'Formação', en: 'Education' },
    run: (_a, { lang }) => [
      ...timeline.flatMap((e) => [out(`${tr(e.period, lang)}`, 'accent'), out(`  ${e.institution} · ${tr(e.program, lang)}`)]),
      out('NOW', 'accent'),
      out('  ' + now.words.map((w) => tr(w, lang)).join(' / ')),
    ],
  },

  contact: {
    description: { pt: 'Canais de contato', en: 'Contact channels' },
    run: (_a, { lang }) => [
      out(`email     ${site.email}`),
      out(`github    ${site.links.github.url || (lang === 'pt' ? 'em breve' : 'coming soon')}`),
      out(`linkedin  ${site.links.linkedin.url || (lang === 'pt' ? 'em breve' : 'coming soon')}`),
      blank,
      out(lang === 'pt' ? "'email' copia o endereço · 'cv' baixa o currículo" : "'email' copies the address · 'cv' downloads the résumé", 'muted'),
    ],
  },

  email: {
    description: { pt: 'Copia o email', en: 'Copy email address' },
    run: async (_a, { lang, copyEmail }) => {
      await copyEmail();
      return [out(lang === 'pt' ? `Copiado: ${site.email}` : `Copied: ${site.email}`, 'ok')];
    },
  },

  cv: {
    description: { pt: 'Baixa o currículo', en: 'Download résumé' },
    run: (_a, { lang, downloadCv }) => {
      downloadCv();
      return [out(lang === 'pt' ? 'Download iniciado.' : 'Download started.', 'ok')];
    },
  },

  goto: {
    description: { pt: 'Navega até uma seção', en: 'Jump to a section' },
    usage: 'goto <section>',
    run: (args, { lang, goto, close }) => {
      const id = SECTIONS[(args[0] ?? '').toLowerCase()];
      if (!id) return [out(`goto: ${Object.keys(SECTIONS).slice(2, 8).join(' | ')}`, 'error')];
      close();
      setTimeout(() => goto(id), 200);
      return [out(lang === 'pt' ? `→ ${args[0]}` : `→ ${args[0]}`, 'ok')];
    },
  },

  audit: {
    description: { pt: 'Verifica os headers de segurança do site', en: "Check this site's security headers" },
    run: async (_a, { lang }) => {
      try {
        const res = await fetch(window.location.origin + '/', { method: 'HEAD', cache: 'no-store' });
        const lines = SECURITY_HEADERS.map((h) => {
          const ok = res.headers.has(h);
          return out(`  ${ok ? '✓' : '✗'} ${h}`, ok ? 'ok' : 'error');
        });
        const passed = SECURITY_HEADERS.filter((h) => res.headers.has(h)).length;
        return [
          out(lang === 'pt' ? `Auditoria de ${window.location.host}` : `Auditing ${window.location.host}`, 'title'),
          ...lines,
          blank,
          out(`${passed}/${SECURITY_HEADERS.length} ${lang === 'pt' ? 'headers presentes' : 'headers present'}`, passed === SECURITY_HEADERS.length ? 'ok' : 'muted'),
          ...(passed === 0
            ? [out(lang === 'pt' ? '(servidor de desenvolvimento: headers ativos em produção)' : '(dev server: headers are enabled in production)', 'muted')]
            : []),
        ];
      } catch {
        return [out('audit: network error', 'error')];
      }
    },
  },

  lang: {
    description: { pt: 'Troca o idioma (pt | en)', en: 'Switch language (pt | en)' },
    usage: 'lang <pt|en>',
    run: (args, { setLang }) => {
      const l = args[0]?.toLowerCase();
      if (l !== 'pt' && l !== 'en') return [out('usage: lang <pt|en>', 'error')];
      setLang(l);
      return [out(l === 'pt' ? 'Idioma: português' : 'Language: English', 'ok')];
    },
  },

  clear: {
    description: { pt: 'Limpa a tela', en: 'Clear the screen' },
    run: (_a, { clear }) => {
      clear();
      return [];
    },
  },

  exit: {
    description: { pt: 'Fecha o terminal', en: 'Close the terminal' },
    run: (_a, { close }) => {
      close();
      return [];
    },
  },

  // ---- easter eggs ----
  sudo: {
    hidden: true,
    description: { pt: '', en: '' },
    run: (_a, { lang }) => [
      out(
        lang === 'pt'
          ? 'arthur não está no arquivo sudoers. Este incidente será reportado.'
          : 'arthur is not in the sudoers file. This incident will be reported.',
        'error',
      ),
      out(lang === 'pt' ? '(brincadeira: princípio do menor privilégio.)' : '(kidding: principle of least privilege.)', 'muted'),
    ],
  },
  ls: {
    hidden: true,
    description: { pt: '', en: '' },
    run: () => [out('about.txt  skills/  projects/  education.log  cv.pdf')],
  },
  cat: {
    hidden: true,
    description: { pt: '', en: '' },
    run: (args, ctx) => {
      if (args[0] === 'about.txt') return commands.about.run([], ctx);
      if (args[0] === 'education.log') return commands.education.run([], ctx);
      return [out(`cat: ${args[0] ?? ''}: No such file or directory`, 'error')];
    },
  },
  history: {
    hidden: true,
    description: { pt: '', en: '' },
    run: (_a, { history }) => history.map((h, i) => out(`  ${String(i + 1).padStart(3)}  ${h}`)),
  },
  date: {
    hidden: true,
    description: { pt: '', en: '' },
    run: () => [out(new Date().toString())],
  },
  echo: {
    hidden: true,
    description: { pt: '', en: '' },
    run: (args) => [out(args.join(' '))],
  },
};

export const commandNames = Object.keys(commands);

export function runCommand(input: string, ctx: TerminalContext): Result {
  const [name, ...args] = input.trim().split(/\s+/);
  if (!name) return [];
  const cmd = commands[name.toLowerCase()];
  if (!cmd) {
    return [
      out(`${name}: command not found`, 'error'),
      out(ctx.lang === 'pt' ? "Digite 'help' para ver os comandos." : "Type 'help' to list commands.", 'muted'),
    ];
  }
  return cmd.run(args, ctx);
}
