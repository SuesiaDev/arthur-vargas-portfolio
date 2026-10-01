# AV.SYSTEM — Arthur Vargas

Portfólio pessoal de **Arthur Vargas Brandão** — estudante de Segurança Cibernética e desenvolvedor.
O site é apresentado como um sistema que o visitante explora, módulo por módulo:

```
00 BOOT → SYSTEM INTERFACE → 01 IDENTITY → 02 SKILL NETWORK → 03 CASE FILES → 04 TRAJECTORY → 05 CONNECTION
```

O fio condutor é o **Network Core**, um objeto 3D autoral: cinco camadas (Systems, Network,
Development, AI, Design) atravessadas por um **eixo de segurança** — *defense in depth*: segurança
não é uma camada, atravessa todas. No boot ele é visto de perfil e parece uma linha; ao abrir, a linha
se desdobra em 3D; ao longo do scroll ele explode, achata e some no mapa de skills; no fim da página
volta a ser uma linha, apoiada na régua do rodapé.

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de produção (todas as páginas são estáticas)
npm start          # serve a build (headers de segurança ativos só aqui)
npm run lint
npm run typecheck
```

Requer Node 20.9+.

## O que editar

| O quê | Onde |
| --- | --- |
| Email, GitHub, LinkedIn, domínio, CV | `src/data/site.ts` |
| Projetos (cases) | `src/data/projects.ts` |
| Skills e conexões entre elas | `src/data/skills.ts` |
| Formação / timeline | `src/data/education.ts` |
| Todos os textos da interface (PT/EN) | `src/data/copy.ts` |
| Currículo em PDF | `public/cv/arthur-vargas-cv.pdf` |

**GitHub e LinkedIn** ainda estão vazios: preencha `url` em `site.links` e eles aparecem
automaticamente no contato, no terminal e no structured data. Enquanto vazios, mostram "Em breve".

**Domínio:** defina `NEXT_PUBLIC_SITE_URL` (veja `.env.example`) — usado em canonical, Open Graph e sitemap.

### Adicionando um projeto

Acrescente um objeto ao array `projects` em `src/data/projects.ts`. A trilha de projetos, a página
`/work/<slug>`, o sitemap e o comando `projects` do terminal são gerados a partir dele.

Imagens: coloque os arquivos em `public/projects/<slug>/` e preencha `cover` e
`screenshots[].src`. Enquanto não houver imagens, uma composição vetorial é gerada com as cores
de `art` (paleta do cliente), então o layout nunca parece incompleto.

Itens marcados com `TODO` em `projects.ts` (link do site no ar, stack exata) devem ser confirmados.

## Arquitetura

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **CSS Modules + design tokens** (`src/styles/tokens.css`) — sem framework utilitário; controle total da direção de arte
- **GSAP 3.15** (ScrollTrigger, SplitText, ScrambleText, DrawSVG, CustomEase) — todo o motion
- **Lenis** — smooth scroll sincronizado com o ticker do GSAP (desligado em touch e reduced motion)
- **Three.js + React Three Fiber** — Network Core, carregado sob demanda (chunk separado, em paralelo ao boot)
- **Lucide + Simple Icons** — ícones (marcas renderizadas monocromáticas para respeitar a paleta)

```
src/
  app/          rotas, metadata, OG image, sitemap, robots, manifest, 404
  animations/   motion system, coreografia do 3D, rastreamento de seções
  components/   boot, cursor, layout (nav/menu/indicador), three, terminal, case view, ui
  sections/     hero, identity, capabilities, work, trajectory, connection
  data/         todo o conteúdo — separado da interface
  hooks/        useGsap, useMediaQuery, useLocalTime…
  lib/          gsap, i18n, scroll, estado global mínimo, transição dos cases, ícones
  styles/       tokens e base
```

### Design system

Tokens em `src/styles/tokens.css`: cores (preto profundo, graphite, cinza metálico, accents frios
usados com parcimônia), tipografia (Inter Tight + Geist Mono), escala de espaçamento, grid de
12/8/4 colunas, raios, z-index e motion. As curvas de easing são registradas no GSAP com os mesmos
valores (`src/animations/motion.ts`), então CSS e JS se movem do mesmo jeito.

| Motion | Duração |
| --- | --- |
| Interação | 200 ms |
| UI | 420 ms |
| Reveal editorial | 850 ms |
| Transição de seção / view | 1200 ms |

### Detalhes técnicos que valem conversa numa entrevista

- **Coreografia do 3D determinística:** o scroll só registra progresso; a formação-alvo é calculada
  a cada frame a partir dele e amortecida — pular para qualquer ponto da página sempre resolve no estado certo.
- **Geometria no shader:** a altura de cada vértice é `(camada − 2) × uSpread`, então dobrar/explodir a
  estrutura inteira é a escrita de um único uniform. Pacotes de dados são calculados na GPU.
- **Render sob demanda:** o loop do WebGL para quando o objeto está invisível ou um case está aberto.
- **Shared element transition:** cases abrem com a View Transitions API (fallback FLIP), com URL
  própria (`/work/<slug>`), suporte a voltar/avançar e scroll preservado.
- **Headers de segurança:** CSP, HSTS, X-Frame-Options, etc. (`next.config.ts`). O comando `audit`
  do terminal lê os headers da resposta real e mostra o resultado.

## Terminal

Pressione <kbd>`</kbd> (ou o botão no canto inferior) e digite `help`.
Comandos: `whoami`, `about`, `skills [domínio]`, `projects`, `open <n>`, `education`, `contact`,
`email`, `cv`, `goto <seção>`, `audit`, `lang <pt|en>`, `clear`, `exit` — e alguns escondidos.

## Acessibilidade e performance

- HTML semântico, skip link, foco visível, navegação completa por teclado (abas da Skill Network com setas)
- `prefers-reduced-motion`: sem boot, sem smooth scroll, sem pins; o 3D renderiza estático
- Conteúdo legível sem JavaScript (estados iniciais de animação só existem com JS)
- Cursor customizado apenas em ponteiros finos; mobile tem layout e interações próprios
- Auditoria axe-core (WCAG 2.1 AA): sem violações
- JS inicial ≈ 290 KB gz; Three.js (≈ 240 KB gz) carrega em paralelo, fora do caminho crítico

## Deploy

Pronto para a Vercel (ou qualquer host Node): importe o repositório e defina `NEXT_PUBLIC_SITE_URL`.
