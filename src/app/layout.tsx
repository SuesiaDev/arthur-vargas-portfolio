import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Inter_Tight } from 'next/font/google';
import { site } from '@/data/site';
import { skillCategories } from '@/data/skills';
import '@/styles/tokens.css';
import '@/styles/base.css';

const interTight = Inter_Tight({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter-tight',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.seo.title,
    template: `%s | ${site.shortName}`,
  },
  description: site.seo.description,
  keywords: [...site.seo.keywords],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  applicationName: site.shortName,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    alternateLocale: ['en_US'],
    url: '/',
    siteName: site.shortName,
    title: site.seo.title,
    description: site.seo.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.seo.title,
    description: site.seo.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false, email: false, address: false },
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: '#060708',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Runs before first paint: flags JS availability (animation start states are
 * scoped to `.js`, so content stays visible without JavaScript) and whether
 * the boot sequence was already seen this session.
 */
const bootstrap = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('av.booted'))d.classList.add('boot-seen')}catch(e){}if(matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('reduced-motion')})();`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${site.url}/#person`,
      name: site.name,
      alternateName: site.shortName,
      url: site.url,
      email: `mailto:${site.email}`,
      jobTitle: 'Cybersecurity Student & Developer',
      description: site.seo.description,
      address: {
        '@type': 'PostalAddress',
        addressRegion: site.location.region,
        addressCountry: site.location.countryCode,
      },
      alumniOf: [
        { '@type': 'EducationalOrganization', name: 'Super DEV ProWay' },
        { '@type': 'CollegeOrUniversity', name: 'GRAN Faculdade' },
      ],
      knowsLanguage: ['pt-BR', 'en'],
      knowsAbout: skillCategories.flatMap((c) => c.skills.map((s) => s.name.en)),
      sameAs: [site.links.github.url, site.links.linkedin.url].filter(Boolean),
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: site.url,
      name: site.seo.title,
      inLanguage: ['pt-BR', 'en'],
      publisher: { '@id': `${site.url}/#person` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${interTight.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      </head>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
