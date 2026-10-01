'use client';

import { ArrowDownRight, ArrowUpRight, Copy, Download } from 'lucide-react';
import { Magnetic } from './Magnetic';
import styles from './Button.module.css';

const ICONS = { down: ArrowDownRight, up: ArrowUpRight, copy: Copy, download: Download } as const;

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'text';
  icon?: keyof typeof ICONS;
  /** Small index shown before the label, e.g. "03". */
  index?: string;
  download?: string;
  external?: boolean;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  ariaLabel?: string;
}

export function Button({
  children,
  href,
  onClick,
  variant = 'ghost',
  icon,
  index,
  download,
  external,
  onPointerEnter,
  onPointerLeave,
  ariaLabel,
}: ButtonProps) {
  const Icon = icon ? ICONS[icon] : null;
  const content = (
    <>
      {index && (
        <span className={styles.index} aria-hidden="true">
          {index}
        </span>
      )}
      <span className={styles.label}>
        <span className={styles.labelInner} data-text={typeof children === 'string' ? children : undefined}>
          {children}
        </span>
      </span>
      {Icon && (
        <span className={styles.icon} aria-hidden="true">
          <Icon size={15} strokeWidth={1.5} absoluteStrokeWidth />
        </span>
      )}
    </>
  );

  const common = {
    className: `${styles.button} ${styles[variant]}`,
    onPointerEnter,
    onPointerLeave,
    'aria-label': ariaLabel,
  };

  return (
    <Magnetic strength={variant === 'text' ? 4 : 7}>
      {href ? (
        <a
          href={href}
          download={download}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          onClick={onClick}
          {...common}
        >
          {content}
        </a>
      ) : (
        <button type="button" onClick={onClick} {...common}>
          {content}
        </button>
      )}
    </Magnetic>
  );
}
