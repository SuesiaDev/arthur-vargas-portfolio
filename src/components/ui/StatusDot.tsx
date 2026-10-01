import styles from './StatusDot.module.css';

/** Live-status indicator. Pulses slowly; static under reduced motion. */
export function StatusDot({ tone = 'signal' }: { tone?: 'signal' | 'accent' }) {
  return <span className={`${styles.dot} ${styles[tone]}`} aria-hidden="true" />;
}
