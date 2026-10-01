import type { L } from './types';

export interface TimelineEntry {
  id: string;
  /** Large marker on the timeline. */
  marker: string;
  institution: string;
  program: L;
  period: L;
  description: L;
  current?: boolean;
}

const l = (pt: string, en: string = pt): L => ({ pt, en });

export const timeline: TimelineEntry[] = [
  {
    id: 'proway',
    marker: '2023',
    institution: 'Super DEV ProWay',
    program: l('Desenvolvimento Full Stack com foco em Java', 'Full Stack Development focused on Java'),
    period: l('2023 → 2024'),
    description: l(
      'Formação prática em desenvolvimento de aplicações com Java, do back-end ao front-end.',
      'Hands-on training in application development with Java, from back end to front end.',
    ),
  },
  {
    id: 'gran',
    marker: '2026',
    institution: 'GRAN Faculdade',
    program: l('Tecnólogo em Segurança Cibernética', 'Associate Degree in Cybersecurity'),
    period: l('2026 → Atual', '2026 → Present'),
    description: l(
      'Graduação focada em segurança da informação, redes e proteção de sistemas.',
      'A degree focused on information security, networks and systems protection.',
    ),
    current: true,
  },
];

/** The open-ended "NOW" node closing the timeline. */
export const now = {
  marker: 'NOW',
  words: [l('Construindo', 'Building'), l('Aprendendo', 'Learning'), l('Explorando segurança', 'Exploring security')],
  description: l(
    'Laboratórios, projetos e estudo contínuo, enquanto busco a primeira oportunidade para colocar tudo em prática.',
    'Labs, projects and continuous study, while looking for the first opportunity to put it all into practice.',
  ),
};

export const languages = [
  { name: l('Português'), level: l('Nativo', 'Native') },
  { name: l('Inglês', 'English'), level: l('Intermediário', 'Intermediate') },
];
