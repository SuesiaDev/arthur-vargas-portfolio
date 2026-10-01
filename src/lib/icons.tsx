import type { LucideIcon } from 'lucide-react';
import {
  Bot,
  Brain,
  Braces,
  Cable,
  Cpu,
  Fingerprint,
  Gauge,
  Globe,
  IterationCw,
  MessageSquareCode,
  MonitorSmartphone,
  Network,
  PenTool,
  Radar,
  ScanSearch,
  Shield,
  ShieldCheck,
  ShieldHalf,
  Sparkles,
  SquareKanban,
  SquareTerminal,
  Webhook,
  Wrench,
} from 'lucide-react';
import {
  siAngular,
  siClaude,
  siCss,
  siFigma,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siKalilinux,
  siLinux,
  siNodedotjs,
  siPostgresql,
  siSpringboot,
  siTypescript,
} from 'simple-icons';

/** Brand marks render monochrome (currentColor) to stay inside the palette. */
const brand = {
  linux: siLinux.path,
  kali: siKalilinux.path,
  // Official Java (cup) mark — removed from current simple-icons, taken from simple-icons v6 (CC0).
  java:
    'M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639',
  springboot: siSpringboot.path,
  javascript: siJavascript.path,
  typescript: siTypescript.path,
  angular: siAngular.path,
  node: siNodedotjs.path,
  html: siHtml5.path,
  css: siCss.path,
  postgres: siPostgresql.path,
  git: siGit.path,
  github: siGithub.path,
  figma: siFigma.path,
  claude: siClaude.path,
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
} as const;

const glyph = {
  brain: Brain,
  shield: Shield,
  shieldCheck: ShieldCheck,
  shieldHalf: ShieldHalf,
  network: Network,
  cable: Cable,
  globe: Globe,
  fingerprint: Fingerprint,
  scan: ScanSearch,
  radar: Radar,
  braces: Braces,
  webhook: Webhook,
  sparkles: Sparkles,
  bot: Bot,
  terminal: SquareTerminal,
  promptCode: MessageSquareCode,
  cpu: Cpu,
  wrench: Wrench,
  gauge: Gauge,
  penTool: PenTool,
  devices: MonitorSmartphone,
  iteration: IterationCw,
  kanban: SquareKanban,
} satisfies Record<string, LucideIcon>;

export type BrandKey = keyof typeof brand;
export type GlyphKey = keyof typeof glyph;
export type IconKey = BrandKey | GlyphKey;

interface IconProps {
  name: IconKey;
  size?: number;
  /** Position when nested inside another <svg>. */
  x?: number;
  y?: number;
  strokeWidth?: number;
  className?: string;
  /** Accessible name; icons are decorative (aria-hidden) when omitted. */
  title?: string;
}

export function Icon({ name, size = 16, x, y, strokeWidth = 1.5, className, title }: IconProps) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const };

  if (name in brand) {
    // Brand glyphs fill their 24px box edge-to-edge; inset them slightly so
    // they sit at the same optical size as the stroked Lucide glyphs.
    return (
      <svg
        x={x}
        y={y}
        width={size}
        height={size}
        viewBox="-2 -2 28 28"
        fill="currentColor"
        className={className}
        focusable="false"
        {...a11y}
      >
        <path d={brand[name as BrandKey]} />
      </svg>
    );
  }

  const Glyph = glyph[name as GlyphKey];
  return (
    <Glyph
      x={x}
      y={y}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth
      className={className}
      focusable="false"
      {...a11y}
    />
  );
}
