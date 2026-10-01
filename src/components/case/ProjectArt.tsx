import { useId } from 'react';
import type { Project } from '@/data/projects';
import styles from './ProjectArt.module.css';

interface ProjectArtProps {
  project: Project;
  /** "cover" = full composition; "desktop" / "mobile" = single-device frames for the gallery. */
  variant?: 'cover' | 'desktop' | 'mobile';
  /** Variation of the mock layout inside the frames. */
  seed?: number;
}

const SERIF = "Georgia, 'Times New Roman', 'Noto Serif', serif";
const MONO = "ui-monospace, 'SFMono-Regular', Menlo, monospace";

/**
 * Case cover composition: a browser window and a phone in the client palette.
 * Real screenshots (from `case.screenshots`) are placed inside the frames when
 * available; otherwise a vector mock of the site is drawn.
 */
export function ProjectArt({ project, variant = 'cover', seed = 0 }: ProjectArtProps) {
  const { paper, ink, accent, monogram, serif } = project.art;
  const font = serif ? SERIF : 'inherit';
  const alt = (seed + Number(project.index)) % 2 === 0;
  // Unique per instance: the same cover renders in the card and in the case view.
  const id = `${project.slug}-${variant}-${seed}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const shot = (device: 'desktop' | 'mobile') =>
    project.case.screenshots.find((s) => s.device === device && s.src)?.src;
  const desktopShot = shot('desktop');
  const mobileShot = shot('mobile');
  const host = project.links.live ? new URL(project.links.live).hostname.replace(/^www\./, '') : project.slug;
  const bars = (x: number, y: number, widths: number[], h = 9, gap = 18, o = 0.22) =>
    widths.map((w, i) => <rect key={i} x={x} y={y + i * gap} width={w} height={h} rx={h / 2} fill={ink} opacity={o} />);

  const site = (x: number, y: number, w: number, h: number) => (
    <g>
      {/* nav */}
      <rect x={x} y={y} width={w} height={h} fill={paper} />
      <g transform={`translate(${x + 48} ${y + 40})`}>
        <rect width="38" height="38" rx="4" fill="none" stroke={accent} strokeWidth="1.5" />
        <text x="19" y="25" textAnchor="middle" fontFamily={font} fontSize="16" fill={accent}>
          {monogram}
        </text>
        <text x="54" y="25" fontFamily={font} fontSize="19" fill={ink}>
          {project.client}
        </text>
      </g>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={x + w - 420 + i * 78} y={y + 56} width="54" height="7" rx="3.5" fill={ink} opacity="0.35" />
      ))}
      <rect x={x + w - 112} y={y + 42} width="72" height="34" rx="17" fill={accent} />
      <line x1={x} x2={x + w} y1={y + 112} y2={y + 112} stroke={ink} strokeOpacity="0.08" />

      {alt ? (
        <>
          {/* hero — editorial left, image right */}
          <text x={x + 48} y={y + 222} fontFamily={MONO} fontSize="12" letterSpacing="3" fill={accent}>
            {project.type.pt.toUpperCase()}
          </text>
          <text x={x + 46} y={y + 300} fontFamily={font} fontSize="58" fill={ink}>
            {project.title.pt.split(' ')[0]}
          </text>
          <text x={x + 46} y={y + 366} fontFamily={font} fontSize="58" fill={ink} fontStyle="italic" opacity="0.9">
            {project.title.pt.split(' ').slice(1).join(' ')}
          </text>
          {bars(x + 48, y + 410, [380, 340, 260])}
          <rect x={x + 48} y={y + 488} width="170" height="48" rx="24" fill={accent} />
          <rect x={x + 232} y={y + 488} width="150" height="48" rx="24" fill="none" stroke={ink} strokeOpacity="0.3" />
          <g>
            <rect x={x + w - 470} y={y + 160} width="422" height="400" rx="6" fill={`url(#${id}-img)`} />
            {[0, 1, 2].map((i) => (
              <rect
                key={i}
                x={x + w - 410 + i * 110}
                y={y + 250}
                width="62"
                height="280"
                rx="31"
                fill={paper}
                opacity={0.22 + i * 0.12}
              />
            ))}
          </g>
        </>
      ) : (
        <>
          {/* hero — centred statement over a practice-area grid */}
          <text x={x + w / 2} y={y + 214} textAnchor="middle" fontFamily={MONO} fontSize="12" letterSpacing="3" fill={accent}>
            {project.type.pt.toUpperCase()}
          </text>
          <text x={x + w / 2} y={y + 290} textAnchor="middle" fontFamily={font} fontSize="60" fill={ink}>
            {project.client}
          </text>
          {bars(x + w / 2 - 210, y + 322, [420], 9, 18, 0.2)}
          {bars(x + w / 2 - 160, y + 340, [320], 9, 18, 0.2)}
          <rect x={x + w / 2 - 90} y={y + 378} width="180" height="46" rx="23" fill={accent} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${x + 48 + i * ((w - 96 - 36) / 4 + 12)} ${y + 470})`}>
              <rect width={(w - 96 - 36) / 4} height="120" rx="6" fill={ink} opacity="0.045" stroke={ink} strokeOpacity="0.08" />
              <circle cx="30" cy="34" r="12" fill="none" stroke={accent} strokeWidth="1.5" />
              {bars(22, 62, [120, 90], 7, 16, 0.25)}
            </g>
          ))}
        </>
      )}
    </g>
  );

  const phone = (x: number, y: number, w: number, h: number) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="34" fill="#050607" stroke={ink} strokeOpacity="0.16" />
      <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx="26" fill={paper} />
      {mobileShot ? (
        <>
          <clipPath id={`${id}-phone`}>
            <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx="26" />
          </clipPath>
          <image
            href={mobileShot}
            x={x + 10}
            y={y + 10}
            width={w - 20}
            height={h - 20}
            preserveAspectRatio="xMidYMin slice"
            clipPath={`url(#${id}-phone)`}
          />
        </>
      ) : (
        phoneMock(x, y, w, h)
      )}
      <rect x={x + w / 2 - 34} y={y + 20} width="68" height="18" rx="9" fill="#050607" />
    </g>
  );

  const phoneMock = (x: number, y: number, w: number, h: number) => (
    <g>
      <g transform={`translate(${x + 28} ${y + 64})`}>
        <rect width="24" height="24" rx="3" fill="none" stroke={accent} strokeWidth="1.2" />
        <text x="12" y="16" textAnchor="middle" fontFamily={font} fontSize="10" fill={accent}>
          {monogram}
        </text>
        <rect x={w - 92} y="9" width="26" height="2" fill={ink} opacity="0.5" />
        <rect x={w - 92} y="15" width="26" height="2" fill={ink} opacity="0.5" />
      </g>
      <text x={x + 28} y={y + 150} fontFamily={MONO} fontSize="8" letterSpacing="2" fill={accent}>
        {project.type.pt.toUpperCase()}
      </text>
      <text x={x + 26} y={y + 188} fontFamily={font} fontSize="27" fill={ink}>
        {project.title.pt.split(' ')[0]}
      </text>
      <text x={x + 26} y={y + 220} fontFamily={font} fontSize="27" fill={ink} fontStyle="italic" opacity="0.9">
        {project.title.pt.split(' ').slice(1).join(' ').slice(0, 14)}
      </text>
      {bars(x + 28, y + 246, [w - 70, w - 100, w - 120], 6, 13, 0.22)}
      <rect x={x + 28} y={y + 300} width={w - 56} height="38" rx="19" fill={accent} />
      <rect x={x + 28} y={y + 356} width={w - 56} height={h - 400} rx="10" fill={`url(#${id}-img)`} />
    </g>
  );

  const defs = (
    <defs>
      <linearGradient id={`${id}-img`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
        <stop offset="100%" stopColor={accent} stopOpacity="0.06" />
      </linearGradient>
      <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#121619" />
        <stop offset="100%" stopColor="#090b0d" />
      </linearGradient>
      <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0V40" fill="none" stroke="#c4d6e8" strokeOpacity="0.05" />
      </pattern>
    </defs>
  );

  if (variant === 'mobile') {
    return (
      <svg viewBox="0 0 420 860" className={styles.art} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {defs}
        <rect width="420" height="860" fill={`url(#${id}-bg)`} />
        <rect width="420" height="860" fill={`url(#${id}-grid)`} />
        {phone(60, 60, 300, 740)}
      </svg>
    );
  }

  if (variant === 'desktop') {
    return (
      <svg viewBox="0 0 1600 1000" className={styles.art} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {defs}
        <rect width="1600" height="1000" fill={`url(#${id}-bg)`} />
        <rect width="1600" height="1000" fill={`url(#${id}-grid)`} />
        <g transform="translate(100 80)">
          <rect width="1400" height="840" rx="14" fill={paper} stroke={ink} strokeOpacity="0.1" />
          <rect width="1400" height="44" rx="14" fill="#000" opacity="0.18" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={26 + i * 20} cy="22" r="5.5" fill={ink} opacity="0.2" />
          ))}
          <svg x="0" y="44" width="1400" height="796" overflow="hidden">
            {site(0, 0, 1400, 796)}
          </svg>
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 1600 1000" className={styles.art} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {defs}
      <rect width="1600" height="1000" fill={`url(#${id}-bg)`} />
      <rect width="1600" height="1000" fill={`url(#${id}-grid)`} />

      {/* spec annotations */}
      <g fontFamily={MONO} fontSize="13" letterSpacing="2" fill="#c4d6e8" fillOpacity="0.4">
        <line x1="150" x2="1290" y1="92" y2="92" stroke="#c4d6e8" strokeOpacity="0.25" />
        <line x1="150" x2="150" y1="84" y2="100" stroke="#c4d6e8" strokeOpacity="0.4" />
        <line x1="1290" x2="1290" y1="84" y2="100" stroke="#c4d6e8" strokeOpacity="0.4" />
        <text x="720" y="80" textAnchor="middle">
          1440 × 900 · DESKTOP
        </text>
        <text x="1380" y="372">390 · MOBILE</text>
        <text x="150" y="958">
          {`CASE ${project.index} · ${project.client.toUpperCase()}`}
        </text>
      </g>

      <g transform="translate(150 120)">
        <rect width="1140" height="740" rx="14" fill={paper} stroke={ink} strokeOpacity="0.12" />
        <rect width="1140" height="44" rx="14" fill="#000" opacity="0.2" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={26 + i * 20} cy="22" r="5.5" fill={ink} opacity="0.22" />
        ))}
        <rect x="420" y="11" width="300" height="22" rx="11" fill={ink} opacity="0.07" />
        <text x="570" y="27" textAnchor="middle" fontFamily={MONO} fontSize="11" fill={ink} opacity="0.45">
          {host}
        </text>
        {desktopShot ? (
          <>
            <clipPath id={`${id}-win`}>
              <rect x="0" y="30" width="1140" height="710" rx="14" />
            </clipPath>
            <image
              href={desktopShot}
              x="0"
              y="44"
              width="1140"
              height="696"
              preserveAspectRatio="xMidYMin slice"
              clipPath={`url(#${id}-win)`}
            />
          </>
        ) : (
          <svg x="0" y="44" width="1140" height="696" overflow="hidden">
            <g transform="scale(0.8143)">{site(0, 0, 1400, 855)}</g>
          </svg>
        )}
      </g>

      <g style={{ filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.55))' }}>{phone(1210, 390, 260, 540)}</g>
    </svg>
  );
}
