import { ImageResponse } from 'next/og';
import { site } from '@/data/site';
import { OgTemplate } from './og-template';

export const alt = site.seo.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(<OgTemplate />, size);
}
