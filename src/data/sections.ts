import type { L, SectionId } from './types';

export interface SectionMeta {
  id: SectionId;
  index: string;
  /** System module name — always English, part of the interface language. */
  module: string;
  /** Navigation label. */
  nav: L;
  inNav: boolean;
}

/** Narrative order of the page. The progress indicator reads from here. */
export const sections: SectionMeta[] = [
  { id: 'top', index: '00', module: 'System', nav: { pt: 'Início', en: 'Start' }, inNav: false },
  { id: 'identity', index: '01', module: 'Identity', nav: { pt: 'Sobre', en: 'About' }, inNav: true },
  { id: 'capabilities', index: '02', module: 'Capabilities', nav: { pt: 'Skills', en: 'Skills' }, inNav: true },
  { id: 'work', index: '03', module: 'Case Files', nav: { pt: 'Projetos', en: 'Work' }, inNav: true },
  { id: 'trajectory', index: '04', module: 'Trajectory', nav: { pt: 'Trajetória', en: 'Background' }, inNav: false },
  { id: 'contact', index: '05', module: 'Connection', nav: { pt: 'Contato', en: 'Contact' }, inNav: true },
];

export const sectionCount = sections.length - 1;
