import type { IconKey } from '@/lib/icons';
import type { L } from './types';

export type SkillCategoryId = 'security' | 'development' | 'ai' | 'tools';

export interface Skill {
  id: string;
  name: L;
  icon: IconKey;
  /** One honest line about how the skill is used. Shown in tooltips. */
  note: L;
  /** Cross-links drawn in the Skill Network (treated as undirected). */
  related?: string[];
}

export interface SkillCategory {
  id: SkillCategoryId;
  index: string;
  name: L;
  /** Short code shown on the network hub. */
  code: string;
  description: L;
  icon: IconKey;
  skills: Skill[];
}

const l = (pt: string, en: string = pt): L => ({ pt, en });

export const skillCategories: SkillCategory[] = [
  {
    id: 'security',
    index: '01',
    code: 'SEC',
    name: l('Cybersecurity'),
    icon: 'shield',
    description: l(
      'Foco principal. Fundamentos de sistemas, redes e web para entender como a tecnologia funciona e como protegê-la.',
      'Primary focus. Systems, network and web fundamentals to understand how technology works and how to protect it.',
    ),
    skills: [
      {
        id: 'linux',
        name: l('Linux'),
        icon: 'linux',
        note: l('Linha de comando, permissões, processos e serviços.', 'Command line, permissions, processes and services.'),
        related: ['git', 'hardware'],
      },
      {
        id: 'kali',
        name: l('Kali Linux'),
        icon: 'kali',
        note: l('Ambiente de laboratório para testes e ferramentas de auditoria.', 'Lab environment for testing and audit tooling.'),
        related: ['linux', 'ethical'],
      },
      {
        id: 'networks',
        name: l('Redes', 'Networks'),
        icon: 'network',
        note: l('Arquitetura, endereçamento e segmentação de redes.', 'Network architecture, addressing and segmentation.'),
        related: ['hardware'],
      },
      {
        id: 'tcpip',
        name: l('TCP/IP'),
        icon: 'cable',
        note: l('Modelo em camadas, handshake, portas e transporte.', 'Layered model, handshake, ports and transport.'),
        related: ['networks', 'http'],
      },
      {
        id: 'dns',
        name: l('DNS'),
        icon: 'globe',
        note: l('Resolução de nomes, registros e seu papel na superfície de ataque.', 'Name resolution, records and their role in the attack surface.'),
        related: ['http'],
      },
      {
        id: 'http',
        name: l('HTTP/HTTPS'),
        icon: 'shieldCheck',
        note: l('Requisições, cabeçalhos, TLS e o ciclo de vida de uma requisição.', 'Requests, headers, TLS and the life of a request.'),
        related: ['rest', 'node'],
      },
      {
        id: 'websec',
        name: l('Segurança Web', 'Web Security'),
        icon: 'shieldHalf',
        note: l('Vulnerabilidades comuns (OWASP Top 10) e mitigação.', 'Common vulnerabilities (OWASP Top 10) and mitigation.'),
        related: ['rest', 'spring', 'angular'],
      },
      {
        id: 'infosec',
        name: l('Segurança da Informação', 'Information Security'),
        icon: 'fingerprint',
        note: l('Confidencialidade, integridade e disponibilidade como critério.', 'Confidentiality, integrity and availability as criteria.'),
        related: ['postgres'],
      },
      {
        id: 'ethical',
        name: l('Ethical Hacking'),
        icon: 'scan',
        note: l('Reconhecimento e análise metódica em ambientes controlados.', 'Methodical recon and analysis in controlled environments.'),
        related: ['kali'],
      },
      {
        id: 'secops',
        name: l('SecOps'),
        icon: 'radar',
        note: l('Segurança integrada às operações: monitorar, detectar, responder.', 'Security built into operations: monitor, detect, respond.'),
        related: ['linux', 'git'],
      },
    ],
  },
  {
    id: 'development',
    index: '02',
    code: 'DEV',
    name: l('Desenvolvimento', 'Development'),
    icon: 'braces',
    description: l(
      'Formação full stack com Java: do banco de dados à interface, passando pelas APIs.',
      'Full stack training in Java: from the database to the interface, through the APIs.',
    ),
    skills: [
      {
        id: 'java',
        name: l('Java'),
        icon: 'java',
        note: l('Linguagem base da formação: orientação a objetos e boas práticas.', 'Core language of my training: OOP and good practices.'),
        related: ['spring'],
      },
      {
        id: 'spring',
        name: l('Spring Boot'),
        icon: 'springboot',
        note: l('APIs REST, injeção de dependências e camadas de serviço.', 'REST APIs, dependency injection and service layers.'),
        related: ['rest', 'postgres'],
      },
      {
        id: 'js',
        name: l('JavaScript'),
        icon: 'javascript',
        note: l('Interatividade, DOM e lógica no navegador e no servidor.', 'Interactivity, the DOM and logic in browser and server.'),
        related: ['ts', 'node'],
      },
      {
        id: 'ts',
        name: l('TypeScript'),
        icon: 'typescript',
        note: l('Tipagem estática para código mais previsível e seguro.', 'Static typing for more predictable, safer code.'),
        related: ['angular', 'aidev'],
      },
      {
        id: 'angular',
        name: l('Angular'),
        icon: 'angular',
        note: l('SPAs componentizadas, serviços e consumo de APIs.', 'Component-based SPAs, services and API consumption.'),
        related: ['ts', 'html', 'css'],
      },
      {
        id: 'node',
        name: l('Node.js'),
        icon: 'node',
        note: l('Runtime JavaScript para scripts, ferramentas e APIs.', 'JavaScript runtime for scripts, tooling and APIs.'),
        related: ['rest'],
      },
      {
        id: 'html',
        name: l('HTML5'),
        icon: 'html',
        note: l('Marcação semântica e acessível.', 'Semantic, accessible markup.'),
        related: ['uxui'],
      },
      {
        id: 'css',
        name: l('CSS3'),
        icon: 'css',
        note: l('Layouts responsivos, grid, flexbox e animação.', 'Responsive layouts, grid, flexbox and motion.'),
        related: ['responsive'],
      },
      {
        id: 'rest',
        name: l('REST APIs'),
        icon: 'webhook',
        note: l('Endpoints, status codes e contratos claros entre serviços.', 'Endpoints, status codes and clear contracts between services.'),
        related: ['http'],
      },
      {
        id: 'postgres',
        name: l('PostgreSQL'),
        icon: 'postgres',
        note: l('Modelagem relacional, SQL e integridade dos dados.', 'Relational modelling, SQL and data integrity.'),
        related: ['spring'],
      },
    ],
  },
  {
    id: 'ai',
    index: '03',
    code: 'AI',
    name: l('IA & Automação', 'AI & Automation'),
    icon: 'sparkles',
    description: l(
      'IA como multiplicador: desenvolvimento assistido, automação e prompts bem estruturados.',
      'AI as a multiplier: assisted development, automation and well-structured prompts.',
    ),
    skills: [
      {
        id: 'genai',
        name: l('IA Generativa', 'Generative AI'),
        icon: 'sparkles',
        note: l('Modelos generativos aplicados a problemas reais.', 'Generative models applied to real problems.'),
        related: ['prompt'],
      },
      {
        id: 'aidev',
        name: l('Dev assistido por IA', 'AI-Assisted Dev'),
        icon: 'bot',
        note: l('Agentes de código no fluxo diário, sempre com revisão crítica.', 'Coding agents in the daily flow, always with critical review.'),
        related: ['claude', 'codex', 'ts'],
      },
      {
        id: 'claude',
        name: l('Claude Code'),
        icon: 'claude',
        note: l('Agente de desenvolvimento para planejar, implementar e revisar.', 'Development agent to plan, implement and review.'),
        related: ['aidev', 'git'],
      },
      {
        id: 'codex',
        name: l('OpenAI Codex'),
        icon: 'terminal',
        note: l('Automação de tarefas de código e refatoração.', 'Automating coding tasks and refactors.'),
        related: ['aidev'],
      },
      {
        id: 'prompt',
        name: l('Engenharia de Prompts', 'Prompt Engineering'),
        icon: 'promptCode',
        note: l('Instruções claras, contexto e critérios de avaliação.', 'Clear instructions, context and evaluation criteria.'),
        related: ['genai', 'claude'],
      },
    ],
  },
  {
    id: 'tools',
    index: '04',
    code: 'SYS',
    name: l('Hardware & Ferramentas', 'Hardware & Tools'),
    icon: 'cpu',
    description: l(
      'A camada física e o fluxo de trabalho: hardware, versionamento, design e métodos ágeis.',
      'The physical layer and the workflow: hardware, version control, design and agile methods.',
    ),
    skills: [
      {
        id: 'hardware',
        name: l('Hardware'),
        icon: 'cpu',
        note: l('Arquitetura de computadores e seus componentes.', 'Computer architecture and its components.'),
        related: ['linux'],
      },
      {
        id: 'assembly',
        name: l('Montagem de PCs', 'PC Assembly'),
        icon: 'wrench',
        note: l('Montagem, upgrade e manutenção de computadores.', 'Building, upgrading and maintaining computers.'),
        related: ['hardware'],
      },
      {
        id: 'diagnostics',
        name: l('Diagnóstico de Hardware', 'Hardware Diagnostics'),
        icon: 'gauge',
        note: l('Isolar falhas com método: testar, medir, confirmar.', 'Isolating faults methodically: test, measure, confirm.'),
        related: ['hardware', 'linux'],
      },
      {
        id: 'git',
        name: l('Git'),
        icon: 'git',
        note: l('Versionamento, branches e histórico limpo.', 'Version control, branches and a clean history.'),
        related: ['github'],
      },
      {
        id: 'github',
        name: l('GitHub'),
        icon: 'github',
        note: l('Repositórios, colaboração e revisão de código.', 'Repositories, collaboration and code review.'),
        related: ['git'],
      },
      {
        id: 'figma',
        name: l('Figma'),
        icon: 'figma',
        note: l('Wireframes, protótipos e sistemas visuais.', 'Wireframes, prototypes and visual systems.'),
        related: ['uxui'],
      },
      {
        id: 'uxui',
        name: l('UX/UI'),
        icon: 'penTool',
        note: l('Hierarquia, clareza e experiência orientada a objetivos.', 'Hierarchy, clarity and goal-driven experience.'),
        related: ['figma', 'responsive', 'html'],
      },
      {
        id: 'responsive',
        name: l('Design Responsivo', 'Responsive Design'),
        icon: 'devices',
        note: l('Interfaces que funcionam do celular ao desktop.', 'Interfaces that work from phone to desktop.'),
        related: ['css'],
      },
      {
        id: 'scrum',
        name: l('Scrum'),
        icon: 'iteration',
        note: l('Sprints, cerimônias e entrega incremental.', 'Sprints, ceremonies and incremental delivery.'),
        related: ['kanban'],
      },
      {
        id: 'kanban',
        name: l('Kanban'),
        icon: 'kanban',
        note: l('Fluxo visual de trabalho e limite de WIP.', 'Visual workflow and WIP limits.'),
        related: ['scrum', 'github'],
      },
    ],
  },
];

export const allSkills = skillCategories.flatMap((c) => c.skills.map((s) => ({ ...s, category: c.id })));
export const skillCount = allSkills.length;

export function findSkill(id: string) {
  return allSkills.find((s) => s.id === id);
}
