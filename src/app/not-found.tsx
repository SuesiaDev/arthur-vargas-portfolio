import Link from 'next/link';

export const metadata = { title: '404 · Signal lost' };

/*
 * Styles are inline on purpose: Next preloads the root not-found boundary's CSS
 * on every route, and an unused preload shows up as a console warning.
 */
const mono: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label)',
  letterSpacing: 'var(--ls-label)',
  textTransform: 'uppercase',
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(60% 50% at 70% 40%, rgba(156,200,242,0.06), transparent 70%), var(--c-bg)',
      }}
    >
      <div className="container" style={{ display: 'grid', gap: 'var(--s-6)' }}>
        <p style={{ ...mono, display: 'inline-flex', alignItems: 'center', gap: 'var(--s-3)', color: 'var(--c-text-2)' }}>
          <span
            aria-hidden="true"
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#e2a3a3', boxShadow: '0 0 10px #e2a3a3' }}
          />
          Error 404 · Route not found
        </p>
        <h1
          style={{
            fontSize: 'var(--fs-display)',
            fontWeight: 500,
            letterSpacing: 'var(--ls-display)',
            lineHeight: 0.9,
          }}
        >
          Signal
          <br />
          lost.
        </h1>
        <p style={{ maxWidth: '34rem', color: 'var(--c-text-2)' }}>
          Esta rota não existe no sistema. <span lang="en">This route does not exist in the system.</span>
        </p>
        <Link
          href="/"
          style={{
            ...mono,
            justifySelf: 'start',
            marginTop: 'var(--s-4)',
            padding: 'var(--s-3) var(--s-5)',
            border: 'var(--border-2)',
            borderRadius: 'var(--r-pill)',
          }}
        >
          ← Return to AV.SYSTEM
        </Link>
      </div>
    </main>
  );
}
