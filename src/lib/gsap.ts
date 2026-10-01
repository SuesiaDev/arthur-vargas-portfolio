'use client';

import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CURVES } from '@/animations/motion';

let registered = false;

export function registerGsap() {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin);
  for (const [name, curve] of Object.entries(CURVES)) CustomEase.create(name, curve);
  gsap.defaults({ ease: 'av-out', duration: 0.85 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

registerGsap();

export { gsap, ScrollTrigger, SplitText };
