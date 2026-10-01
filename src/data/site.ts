import type { L } from './types';

export interface ProfileLink {
  label: string;
  /** Short display value, e.g. "github.com/arthur". Derived from url when empty. */
  handle: string;
  url: string;
}

/**
 * Personal configuration. Edit this file to update links, email and CV.
 * Empty `url` values render as "coming soon" instead of a broken link.
 */
export const site = {
  name: 'Arthur Vargas Brandão',
  shortName: 'Arthur Vargas',
  monogram: 'AV',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arthurvargas.dev').replace(/\/$/, ''),
  email: 'arthurdev047@gmail.com',
  location: {
    city: 'Santa Catarina',
    region: 'SC',
    country: 'Brasil',
    countryCode: 'BR',
    /** Approximate centroid of Santa Catarina — used as a visual coordinate. */
    coords: '27°14′S 50°13′W',
    timeZone: 'America/Sao_Paulo',
  },
  links: {
    github: { label: 'GitHub', handle: 'github.com/SuesiaDev', url: 'https://github.com/SuesiaDev' } as ProfileLink,
    linkedin: {
      label: 'LinkedIn',
      handle: 'linkedin.com/in/arthurdev047',
      url: 'https://www.linkedin.com/in/arthurdev047',
    } as ProfileLink,
  },
  cv: {
    // Replace /public/cv/arthur-vargas-cv.pdf with your own file (keep the name or update here).
    href: '/cv/arthur-vargas-cv.pdf',
    fileName: 'Arthur-Vargas-Brandao-CV.pdf',
  },
  seo: {
    title: 'Arthur Vargas | Cybersecurity & Development',
    description:
      'Cybersecurity student and developer from Brazil focused on security, systems, web development and modern technology.',
    keywords: [
      'Arthur Vargas',
      'Arthur Vargas Brandão',
      'Cybersecurity',
      'Segurança Cibernética',
      'Segurança da Informação',
      'SecOps',
      'Desenvolvedor',
      'Java',
      'Spring Boot',
      'Angular',
      'TypeScript',
      'Santa Catarina',
      'Portfolio',
    ],
  },
  system: {
    name: 'AV.SYSTEM',
    version: '1.0.26',
    session: '0x2F1A',
  },
} as const;

export const roleLine: L = {
  pt: 'Cybersecurity · Desenvolvimento · IA',
  en: 'Cybersecurity · Development · AI',
};
