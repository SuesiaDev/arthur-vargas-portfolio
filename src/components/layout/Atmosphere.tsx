import styles from './Atmosphere.module.css';

/**
 * Global, static texture under the content: a soft vignette and film noise.
 * Purely decorative.
 */
export function Atmosphere() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.vignette} />
      <div className={styles.noise} />
    </div>
  );
}
