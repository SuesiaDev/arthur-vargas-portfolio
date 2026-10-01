import type { L } from './types';

const l = (pt: string, en: string = pt): L => ({ pt, en });

/** All interface copy. System/module labels stay in English by design. */
export const copy = {
  meta: {
    skip: l('Pular para o conteúdo', 'Skip to content'),
    langSwitch: l('Mudar idioma para inglês', 'Switch language to Portuguese'),
  },

  nav: {
    home: l('Arthur Vargas, início', 'Arthur Vargas, home'),
    menu: l('Menu'),
    close: l('Fechar', 'Close'),
    online: l('Online'),
    primary: l('Navegação principal', 'Primary navigation'),
  },

  hero: {
    kicker: l('Portfólio · 2026', 'Portfolio · 2026'),
    tagline: l(
      'Estudante de Segurança Cibernética e desenvolvedor, transformando conhecimento em soluções de segurança e tecnologia.',
      'Cybersecurity student and developer, turning knowledge into security and technology solutions.',
    ),
    status: l('Em busca da primeira oportunidade em tecnologia', 'Seeking my first opportunity in tech'),
    ctaWork: l('Ver projetos', 'View projects'),
    ctaAbout: l('Sobre mim', 'About me'),
    ctaContact: l('Contato', 'Contact'),
    scroll: l('Role para explorar', 'Scroll to explore'),
    figure: l('Fig. 01 · Network Core'),
    figureNote: l('5 camadas · 1 eixo de segurança', '5 layers · 1 security axis'),
    drag: l('Arraste para girar', 'Drag to rotate'),
  },

  identity: {
    title: l('Identity Module'),
    statement: l(
      'Estudo Segurança Cibernética e construo soluções em tecnologia. Minha base vem de Linux, redes, segurança web e desenvolvimento de aplicações, conhecimentos desenvolvidos por meio de estudo contínuo e projetos práticos.',
      'I study cybersecurity and build technology solutions. My foundation comes from Linux, networks, web security and application development, knowledge built through continuous study and hands-on projects.',
    ),
    body: [
      l(
        'Também tenho experiência com hardware: montagem, manutenção e diagnóstico de computadores. Entender a máquina de ponta a ponta, do componente à aplicação.',
        'I also have experience with hardware: building, maintaining and diagnosing computers. Understanding the machine end to end, from component to application.',
      ),
      l(
        'Minha experiência em desenvolvimento me dá uma visão mais ampla sobre aplicações, APIs e bancos de dados e, consequentemente, sobre como analisá-los e protegê-los. Atualmente, direciono meus estudos para Segurança da Informação, SecOps e Segurança de Redes, buscando transformar conhecimento teórico em prática.',
        'My development experience gives me a broader view of applications, APIs and databases and, consequently, of how to analyse and protect them. I am currently focusing my studies on Information Security, SecOps and Network Security, turning theoretical knowledge into practice.',
      ),
    ],
    principles: [
      {
        title: l('Security-first'),
        text: l('Entender como sistemas funcionam para saber como protegê-los.', 'Understand how systems work to know how to protect them.'),
      },
      {
        title: l('Base de desenvolvedor', 'Builder background'),
        text: l('Java, APIs e bancos de dados: a visão de quem constrói.', 'Java, APIs and databases: the view from the builder’s side.'),
      },
      {
        title: l('Aprendizado contínuo', 'Continuous learning'),
        text: l('Autodidata e curioso, com estudo e prática constantes.', 'Self-taught and curious, with steady study and practice.'),
      },
    ],
    spec: {
      record: l('Registro', 'Record'),
      rows: [
        { key: 'Subject', value: l('Arthur_Vargas_Brandão') },
        { key: 'Location', value: l('SC / Brasil', 'SC / Brazil') },
        { key: 'Status', value: l('Disponível', 'Available'), live: true },
        { key: 'Focus', value: l('Cybersecurity') },
        { key: 'Secondary', value: l('Desenvolvimento', 'Development') },
        { key: 'Education', value: l('GRAN · Seg. Cibernética', 'GRAN · Cybersecurity') },
        { key: 'Languages', value: l('PT-BR · EN intermediário', 'PT-BR · EN intermediate') },
        { key: 'Mode', value: l('Aprendizado contínuo', 'Continuous learning') },
      ],
    },
  },

  capabilities: {
    title: l('Matriz de capacidades', 'Capability matrix'),
    intro: l(
      'Quatro domínios, uma rede. Role ou passe o cursor pelos nós para ver como cada área se conecta às outras.',
      'Four domains, one network. Scroll or hover the nodes to see how each area connects to the others.',
    ),
    nodes: l('nós', 'nodes'),
    domains: l('domínios', 'domains'),
    links: l('Conecta com', 'Links to'),
    hint: l('Passe o cursor sobre um nó', 'Hover a node'),
    listLabel: l('Habilidades em', 'Skills in'),
    tabsLabel: l('Domínios de habilidade', 'Skill domains'),
  },

  work: {
    title: l('Projetos selecionados', 'Selected work'),
    intro: l(
      'Cada projeto é tratado como um caso: contexto, processo e solução.',
      'Each project is treated as a case: context, process and solution.',
    ),
    records: l('registros', 'records'),
    viewCase: l('Ver case', 'View case'),
    slotTitle: l('Próximo registro', 'Next entry'),
    slotText: l('Em desenvolvimento. Novos cases entram aqui em breve.', 'In development. New cases land here soon.'),
    hint: l('Role para navegar', 'Scroll to browse'),
  },

  case: {
    close: l('Fechar', 'Close'),
    back: l('Voltar aos projetos', 'Back to work'),
    client: l('Cliente', 'Client'),
    type: l('Tipo', 'Type'),
    role: l('Função', 'Role'),
    year: l('Ano', 'Year'),
    challenge: l('Desafio', 'Challenge'),
    solution: l('Solução', 'Solution'),
    process: l('Processo', 'Process'),
    stack: l('Tecnologias', 'Technologies'),
    deliverables: l('Entregas', 'Deliverables'),
    outcome: l('Resultado', 'Outcome'),
    screens: l('Telas', 'Screens'),
    visit: l('Visitar site', 'Visit site'),
    github: l('Ver no GitHub', 'View on GitHub'),
    soon: l('Link em breve', 'Link coming soon'),
    next: l('Próximo case', 'Next case'),
  },

  trajectory: {
    title: l('Trajetória', 'Trajectory'),
    intro: l('Do código à segurança: uma base construída em camadas.', 'From code to security: a foundation built in layers.'),
    languages: l('Idiomas', 'Languages'),
  },

  contact: {
    headline: [l('Aberto a', 'Open to'), l('oportunidades.', 'opportunities.')],
    text: l(
      'Estou em busca de uma oportunidade para transformar meus estudos e projetos em experiência profissional, contribuindo com minha base em tecnologia, desenvolvimento e segurança cibernética. Quero fazer parte de um time onde possa aprender, assumir responsabilidades e evoluir na prática.',
      'I am looking for an opportunity to turn my studies and projects into professional experience, contributing my foundation in technology, development and cybersecurity. I want to be part of a team where I can learn, take on responsibilities and grow through practice.',
    ),
    email: l('Email'),
    cv: l('Currículo', 'Résumé'),
    cvValue: l('PDF · 1 página', 'PDF · 1 page'),
    copy: l('Copiar', 'Copy'),
    copied: l('Copiado.', 'Copied.'),
    open: l('Abrir', 'Open'),
    download: l('Baixar CV', 'Download CV'),
    soon: l('Em breve', 'Coming soon'),
    backToTop: l('Voltar ao topo', 'Back to top'),
    session: l('Sessão', 'Session'),
  },

  terminal: {
    open: l('Abrir terminal', 'Open terminal'),
    close: l('Fechar terminal', 'Close terminal'),
    label: l('Terminal interativo', 'Interactive terminal'),
    input: l('Comando', 'Command'),
    welcome: l(
      'Interface de comando do AV.SYSTEM. Digite `help` para ver os comandos.',
      'AV.SYSTEM command interface. Type `help` to list commands.',
    ),
  },
} as const;
