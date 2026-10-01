'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_-:.';

interface ScrambleProps {
  text: string;
  /** "view" decodes once when scrolled into view; "mount" decodes immediately. */
  trigger?: 'view' | 'mount';
  duration?: number;
  delay?: number;
  className?: string;
  as?: 'span' | 'strong' | 'p';
}

/**
 * Text that "decrypts" into place. The final text is rendered on the server,
 * so it's readable without JavaScript and for assistive technology.
 */
export function Scramble({ text, trigger = 'view', duration = 0.9, delay = 0, className, as = 'span' }: ScrambleProps) {
  const ref = useRef<HTMLElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = text;
      return;
    }

    const play = () => {
      played.current = true;
      gsap.to(el, {
        duration,
        delay,
        ease: 'none',
        scrambleText: { text, chars: GLYPHS, speed: 0.7, revealDelay: duration * 0.35 },
      });
    };

    // Language switches re-decode text that already played.
    if (played.current || trigger === 'mount') {
      play();
      return;
    }

    const st = ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: play });
    return () => st.kill();
  }, [text, trigger, duration, delay]);

  const Tag = as;
  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {text}
    </Tag>
  );
}
