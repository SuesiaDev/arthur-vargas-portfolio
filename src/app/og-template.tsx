import { site } from '@/data/site';

/** Shared art direction for Open Graph / Twitter images (rendered by next/og). */
export function OgTemplate() {
  const layers = [0, 1, 2, 3, 4];
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        background: 'linear-gradient(160deg, #0b0e11 0%, #050607 60%)',
        color: '#edf1f5',
        position: 'relative',
        fontFamily: 'sans-serif',
      }}
    >
      {/* network core, flattened into an isometric stack */}
      {layers.map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            right: 110,
            top: 150 + i * 46,
            width: 250,
            height: 250,
            border: '1.5px solid rgba(156,200,242,0.4)',
            borderRadius: 16,
            background: 'rgba(127,169,212,0.05)',
            // isometric projection: squash, then rotate
            transform: 'scaleY(0.55) rotate(45deg)',
            display: 'flex',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          right: 234,
          top: 160,
          width: 2,
          height: 300,
          background: 'linear-gradient(180deg, rgba(116,208,220,0), rgba(116,208,220,0.8), rgba(116,208,220,0))',
          display: 'flex',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 20, letterSpacing: 4, color: '#a6afb8' }}>
        <div
          style={{
            width: 44,
            height: 44,
            border: '1.5px solid rgba(196,214,232,0.35)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#edf1f5',
            fontSize: 16,
            letterSpacing: 1,
          }}
        >
          AV
        </div>
        {`${site.system.name} · PORTFOLIO`}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 132, fontWeight: 600, letterSpacing: -6, lineHeight: 0.9 }}>ARTHUR</div>
        <div style={{ fontSize: 132, fontWeight: 600, letterSpacing: -6, lineHeight: 0.9, marginLeft: 120, color: '#c9d1d9' }}>
          VARGAS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 40, fontSize: 26, color: '#a6afb8' }}>
          <div style={{ width: 10, height: 10, borderRadius: 10, background: '#74d0dc', display: 'flex' }} />
          Cybersecurity · Development · AI · Santa Catarina, Brazil
        </div>
      </div>
    </div>
  );
}
