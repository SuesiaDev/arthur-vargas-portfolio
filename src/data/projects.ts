import type { L } from './types';

/**
 * PROJECT DATABASE
 * ----------------------------------------------------------------------------
 * To add a project: append an entry to `projects`. Everything else — the
 * Work track, the case view, /work/[slug] pages, sitemap and the terminal
 * `projects` command — is generated from this array.
 *
 * Images: drop files in /public/projects/<slug>/ and set `cover` and
 * `screenshots[].src`. While empty, a generated art direction is rendered
 * from `art` so the layout never looks unfinished.
 */

export interface ProjectArt {
  /** Background of the mock site. */
  paper: string;
  /** Text colour of the mock site. */
  ink: string;
  /** Brand accent of the client. */
  accent: string;
  /** Monogram used in the mock logotype. */
  monogram: string;
  /** Use a serif for the mock logotype (law firms, editorial brands). */
  serif?: boolean;
}

export interface ProjectScreenshot {
  src?: string;
  /** Intrinsic size of `src` — keeps the gallery layout stable while images load. */
  width?: number;
  height?: number;
  device: 'desktop' | 'mobile';
  alt: L;
  caption: L;
}

export interface Project {
  slug: string;
  index: string;
  client: string;
  title: L;
  type: L;
  role: L;
  year?: string;
  tags: L[];
  summary: L;
  cover?: string;
  art: ProjectArt;
  links: { live?: string; github?: string };
  case: {
    challenge: L;
    solution: L;
    process: { title: L; text: L }[];
    stack: string[];
    deliverables: L[];
    results: { label: L; value: L }[];
    screenshots: ProjectScreenshot[];
  };
}

const l = (pt: string, en: string = pt): L => ({ pt, en });

const TAG = {
  landing: l('Landing Page'),
  performance: l('Performance'),
  uxui: l('UX/UI'),
  seo: l('SEO'),
  dev: l('Desenvolvimento', 'Development'),
  leads: l('Geração de leads', 'Lead Generation'),
};

export const projects: Project[] = [
  {
    slug: 'dr-roberto-vargas',
    index: '01',
    client: 'Dr. Roberto Vargas',
    title: l('Advocacia Previdenciária', 'Social Security Law'),
    type: l('Landing page profissional', 'Professional landing page'),
    role: l('Design & Desenvolvimento', 'Design & Development'),
    tags: [TAG.landing, TAG.uxui, TAG.seo, TAG.dev, TAG.leads],
    summary: l(
      'Landing page profissional para advogado previdenciário: interface moderna, conteúdo organizado com estratégia e estrutura pensada para SEO e geração de leads.',
      'A professional landing page for a social security lawyer: a modern interface, strategically organised content and a structure built for SEO and lead generation.',
    ),
    art: { paper: '#0c121c', ink: '#ece3d1', accent: '#b49a6c', monogram: 'RV', serif: true },
    links: {
      live: 'https://www.vargasadvprevidenciario.com.br/',
    },
    case: {
      challenge: l(
        'Comunicar um tema técnico, o direito previdenciário, com clareza e confiança para um público que costuma chegar com dúvidas, e transformar essas visitas em contatos qualificados.',
        'Communicate a technical subject, social security law, with clarity and trust to an audience that usually arrives full of questions, and turn those visits into qualified contacts.',
      ),
      solution: l(
        'Arquitetura de conteúdo guiada pelas principais dúvidas do público, hierarquia visual limpa, chamadas para ação posicionadas nos pontos de decisão e uma base técnica otimizada para mecanismos de busca.',
        'A content architecture driven by the audience’s main questions, a clean visual hierarchy, calls to action placed at decision points and a technical foundation optimised for search engines.',
      ),
      process: [
        { title: l('Descoberta', 'Discovery'), text: l('Entender o serviço, o público e os objetivos do escritório.', 'Understanding the practice, its audience and its goals.') },
        { title: l('Arquitetura', 'Architecture'), text: l('Organizar serviços e jornadas em uma estrutura clara.', 'Organising services and journeys into a clear structure.') },
        { title: l('Interface', 'Interface'), text: l('UI moderna, sóbria e responsiva, com foco em legibilidade.', 'A modern, sober, responsive UI focused on readability.') },
        { title: l('Desenvolvimento', 'Development'), text: l('Implementação semântica, leve e acessível.', 'Semantic, lightweight and accessible implementation.') },
        { title: l('SEO & Lançamento', 'SEO & Launch'), text: l('Metadados, estrutura de headings e indexação.', 'Metadata, heading structure and indexing.') },
      ],
      // TODO: confirm the exact stack used in this project.
      stack: ['HTML5', 'CSS3', 'JavaScript', 'SEO On-page', 'Responsive Design'],
      deliverables: [
        l('Arquitetura de informação', 'Information architecture'),
        l('UI design responsivo', 'Responsive UI design'),
        l('Desenvolvimento front-end', 'Front-end development'),
        l('SEO on-page', 'On-page SEO'),
        l('Estratégia de conversão', 'Conversion strategy'),
      ],
      results: [
        { label: l('Experiência', 'Experience'), value: l('Responsiva do mobile ao desktop', 'Responsive from mobile to desktop') },
        { label: l('Visibilidade', 'Visibility'), value: l('Estrutura semântica e metadados para SEO', 'Semantic structure and metadata for SEO') },
        { label: l('Conversão', 'Conversion'), value: l('CTAs estratégicos e canais diretos de contato', 'Strategic CTAs and direct contact channels') },
      ],
      screenshots: [
        {
          src: '/projects/dr-roberto-vargas/desktop.webp',
          width: 1900,
          height: 947,
          device: 'desktop',
          alt: l('Página inicial da landing page no desktop', 'Landing page home on desktop'),
          caption: l('Home · desktop', 'Home · desktop'),
        },
        {
          src: '/projects/dr-roberto-vargas/mobile.webp',
          width: 484,
          height: 948,
          device: 'mobile',
          alt: l('Página inicial da landing page no celular', 'Landing page home on mobile'),
          caption: l('Home · mobile', 'Home · mobile'),
        },
      ],
    },
  },
  {
    slug: 'despachante-navegantes',
    index: '02',
    client: 'Despachante Navegantes',
    title: l('Despachante veicular', 'Vehicle documentation services'),
    type: l('Landing page profissional', 'Professional landing page'),
    role: l('Design & Desenvolvimento', 'Design & Development'),
    tags: [TAG.landing, TAG.uxui, TAG.seo, TAG.dev, TAG.performance],
    summary: l(
      'Landing page profissional para despachante veicular em Navegantes: design responsivo, foco em conversão e arquitetura estática de alta performance construída com Astro.',
      'A professional landing page for a vehicle documentation service in Navegantes: responsive design, a focus on conversion and a high-performance static architecture built with Astro.',
    ),
    art: { paper: '#0b0b0c', ink: '#f2f2f0', accent: '#f2c318', monogram: 'DN' },
    links: {
      live: 'https://despachante-navegantes.vercel.app/',
    },
    case: {
      challenge: l(
        'Apresentar um serviço burocrático, a documentação de veículos, de forma simples e confiável, levando o visitante rapidamente até o atendimento.',
        'Present a bureaucratic service, vehicle documentation, in a simple and trustworthy way, taking the visitor straight to getting in touch.',
      ),
      solution: l(
        'Uma landing page objetiva, com hierarquia clara, chamadas para ação diretas para o atendimento e uma arquitetura estática em Astro que entrega páginas leves, rápidas e preparadas para os buscadores.',
        'A focused landing page with a clear hierarchy, direct calls to action and a static Astro architecture that delivers light, fast pages ready for search engines.',
      ),
      process: [
        { title: l('Descoberta', 'Discovery'), text: l('Entender os serviços, o público e os diferenciais do despachante.', 'Understanding the services, the audience and what sets the business apart.') },
        { title: l('Conteúdo', 'Content'), text: l('Serviços, vantagens e FAQ organizados para uma decisão rápida.', 'Services, benefits and FAQ organised for a quick decision.') },
        { title: l('Interface', 'Interface'), text: l('Identidade escura com amarelo de alto contraste, responsiva do celular ao desktop.', 'A dark identity with high-contrast yellow, responsive from phone to desktop.') },
        { title: l('Desenvolvimento', 'Development'), text: l('Astro, TypeScript e Tailwind CSS, com baixo uso de JavaScript.', 'Astro, TypeScript and Tailwind CSS, with minimal JavaScript.') },
        { title: l('SEO & Performance', 'SEO & Performance'), text: l('Imagens otimizadas, sitemap e Open Graph.', 'Optimised images, sitemap and Open Graph.') },
      ],
      stack: ['Astro', 'TypeScript', 'Tailwind CSS', 'JavaScript'],
      deliverables: [
        l('Landing page profissional', 'Professional landing page'),
        l('Design responsivo', 'Responsive design'),
        l('Otimização de imagens e performance', 'Image and performance optimisation'),
        l('Sitemap e Open Graph', 'Sitemap and Open Graph'),
        l('Arquitetura estática com baixo uso de JavaScript', 'Static architecture with minimal JavaScript'),
      ],
      results: [
        { label: l('Experiência', 'Experience'), value: l('Caminho direto até o atendimento', 'A direct path to getting in touch') },
        { label: l('Performance', 'Performance'), value: l('Páginas estáticas, leves e rápidas', 'Static, light and fast pages') },
        { label: l('Visibilidade', 'Visibility'), value: l('Sitemap, Open Graph e SEO on-page', 'Sitemap, Open Graph and on-page SEO') },
      ],
      screenshots: [
        {
          src: '/projects/despachante-navegantes/desktop.webp',
          width: 1899,
          height: 946,
          device: 'desktop',
          alt: l('Página inicial da landing page no desktop', 'Landing page home on desktop'),
          caption: l('Home · desktop', 'Home · desktop'),
        },
        {
          src: '/projects/despachante-navegantes/mobile.webp',
          width: 479,
          height: 948,
          device: 'mobile',
          alt: l('Página inicial da landing page no celular', 'Landing page home on mobile'),
          caption: l('Home · mobile', 'Home · mobile'),
        },
      ],
    },
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
