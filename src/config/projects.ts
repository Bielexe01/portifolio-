/**
 * PROJETOS — fonte única de dados da seção "Selected Projects".
 *
 * Para adicionar um projeto:
 *   1. Adicione o site em TARGETS de scripts/capture-projects.mjs e rode
 *      `npm run capture -- <slug>`.
 *   2. Adicione as capturas em JOBS de scripts/optimize-images.mjs e rode
 *      `npm run images`.
 *   3. Adicione um objeto em `projects` abaixo. Sem `url`, o botão
 *      "Ver projeto" não aparece. Sem `details`, o botão de detalhes some.
 *
 * Regra: liste em `tech` apenas tecnologias confirmadas no projeto.
 */

export type ChapterLayout = 'cinema' | 'split' | 'offset' | 'mirror' | 'schematic'

export interface ProjectShot {
  /** Prefixo do arquivo em public/projects (sem largura nem extensão). */
  src: string
  alt: string
  kind: 'desktop' | 'mobile'
  /** Proporção da moldura (largura / altura). Menor que a captura = corta a parte de baixo. */
  aspect?: number
}

export interface ProjectDetail {
  label: string
  items: string[]
}

export interface Project {
  slug: string
  name: string
  /** Categoria curta exibida acima do nome. */
  kicker: string
  /** O problema que o projeto resolve. */
  problem: string
  /** O que foi construído. */
  summary: string
  /** Somente tecnologias confirmadas. */
  tech: string[]
  /** Endereço público. Sem ele, nenhum botão "Ver projeto" é exibido. */
  url?: string
  layout: ChapterLayout
  /** Clima visual do capítulo durante a rolagem. */
  atmosphere: { base: string; glow: string; accent: string }
  shots: { primary?: ProjectShot; secondary?: ProjectShot; mobile?: ProjectShot }
  details?: ProjectDetail[]
  /** Observação de transparência exibida nos detalhes. */
  note?: string
}

export const SHOT_WIDTHS: Record<ProjectShot['kind'], number[]> = {
  desktop: [960, 1600],
  mobile: [390, 780],
}

export const SHOT_SIZE: Record<ProjectShot['kind'], { width: number; height: number }> = {
  desktop: { width: 1600, height: 1000 },
  mobile: { width: 390, height: 844 },
}

export const projects: Project[] = [
  {
    slug: 'drop-coffee',
    name: 'DROP COFFEE',
    kicker: 'Marca conceito · Cafés especiais',
    problem: 'Fazer uma cafeteria de cafés especiais ser sentida antes do primeiro gole.',
    summary:
      'Site conceito para uma cafeteria fictícia. Tipografia gigante, produto em primeiro plano e rolagem suave contam a história da marca: seu momento, sua energia, seu café.',
    tech: ['React', 'Tailwind CSS', 'GSAP', 'Lenis'],
    url: 'https://coffenyv.vercel.app/',
    layout: 'cinema',
    atmosphere: { base: '#140e0a', glow: '#b8743f', accent: '#e8a66b' },
    shots: {
      primary: {
        src: 'drop-coffee-hero',
        kind: 'desktop',
        alt: 'Página inicial do DROP COFFEE com o título "Coffee that hits different." e um copo de café em destaque.',
      },
      secondary: {
        src: 'drop-coffee-cinema',
        kind: 'desktop',
        alt: 'Seção escura do DROP COFFEE com o título "Not just coffee. An experience."',
      },
      mobile: {
        src: 'drop-coffee-mobile',
        kind: 'mobile',
        alt: 'DROP COFFEE no celular, com o copo de café e o botão "Explorar cardápio".',
      },
    },
    details: [
      {
        label: 'Experiência',
        items: [
          'Narrativa visual guiada pela rolagem, do produto à experiência da marca.',
          'Tipografia de impacto combinada com imagens do produto.',
          'Chamada direta para explorar o cardápio.',
        ],
      },
      {
        label: 'Stack identificada no build publicado',
        items: [
          'React para a interface.',
          'Tailwind CSS para o estilo.',
          'GSAP para as animações.',
          'Lenis para a rolagem suave.',
          'Lucide para os ícones.',
        ],
      },
    ],
    note: 'DROP COFFEE é uma marca fictícia, criada como projeto conceito. Não é um cliente real.',
  },
  {
    slug: 'nyvora',
    name: 'NYVORA',
    kicker: 'Estúdio digital · São Paulo',
    problem:
      'Apresentar um estúdio que entrega sites, lojas virtuais e painéis próprios, e continua cuidando depois do lançamento.',
    summary:
      'Site do estúdio NYVORA. Uma narrativa vertical que sobe da cidade até acima das nuvens e apresenta estúdio, projetos, soluções, processo e a demonstração do NYVADMIN, um painel editável.',
    tech: ['Next.js'],
    url: 'https://nyvora.tech/',
    layout: 'split',
    atmosphere: { base: '#0b0c1d', glow: '#6d55e8', accent: '#b9aaff' },
    shots: {
      primary: {
        src: 'nyvora-hero',
        kind: 'desktop',
        alt: 'Abertura do site NYVORA: horizonte noturno de uma cidade com a lua cheia.',
      },
      secondary: {
        src: 'nyvora-clouds',
        kind: 'desktop',
        alt: 'Seção do site NYVORA com prédios acima das nuvens sob a lua.',
      },
      mobile: {
        src: 'nyvora-mobile',
        kind: 'mobile',
        alt: 'NYVORA no celular, com a cidade à noite e a instrução "Role para subir".',
      },
    },
    details: [
      {
        label: 'Seções do site',
        items: [
          'Estúdio, projetos, soluções e processo em 6 etapas.',
          'NYVADMIN: demonstração de um painel editável.',
          'NyvCare: cuidado contínuo depois do lançamento.',
          'Perguntas frequentes e contato.',
        ],
      },
      {
        label: 'Stack identificada no build publicado',
        items: ['Next.js.'],
      },
    ],
    note: 'Os créditos do próprio site informam: imagens geradas no KAIROGEN e tratadas pela NYVORA.',
  },
  {
    slug: 'motors',
    name: 'MOTORS',
    kicker: 'Plataforma de concessionária',
    problem:
      'Uma loja de carros precisa de vitrine e de operação: estoque, página de cada veículo, captação de contatos e gestão em um só lugar.',
    summary:
      'Site e painel para concessionária. O cliente navega pelo estoque, abre cada veículo, salva favoritos, anuncia o próprio carro e fala com a loja. A equipe gerencia veículos, leads e configurações em uma área administrativa.',
    tech: ['React', 'React Router', 'Framer Motion', 'Zustand', 'Tailwind CSS', 'Lenis'],
    url: 'https://motors.nyvora.tech/',
    layout: 'offset',
    atmosphere: { base: '#0c0a09', glow: '#f2581a', accent: '#ff8a4c' },
    shots: {
      primary: {
        src: 'motors-hero',
        kind: 'desktop',
        // Corta a faixa de números do próprio site (não são métricas deste portfólio).
        aspect: 1600 / 720,
        alt: 'Página inicial do Nyv Motors: garagem com luzes hexagonais e o título "Seu próximo carro já está na garagem."',
      },
      secondary: {
        src: 'motors-vitrine',
        kind: 'desktop',
        alt: 'Vitrine de veículos do Nyv Motors com cartões de carros.',
      },
      mobile: {
        src: 'motors-mobile',
        kind: 'mobile',
        alt: 'Nyv Motors no celular, com os botões "Ver estoque" e "Vender meu carro".',
      },
    },
    details: [
      {
        label: 'Área pública',
        items: ['Início e vitrine.', 'Estoque de veículos.', 'Página individual de cada veículo.', 'Favoritos.', 'Vender meu carro.', 'Contato.'],
      },
      {
        label: 'Área administrativa',
        items: ['Login.', 'Dashboard.', 'Gestão de veículos.', 'Gestão de leads.', 'Configurações.'],
      },
      {
        label: 'Arquitetura',
        items: [
          'Rotas separadas com React Router e carregamento sob demanda.',
          'Estado global com Zustand.',
          'Animações com Framer Motion e rolagem suave com Lenis.',
        ],
      },
    ],
  },
  {
    slug: 'jane',
    name: 'JANE MATERIAIS PARA CONSTRUÇÃO',
    kicker: 'Loja de materiais · Guariba, SP',
    problem:
      'Uma loja física precisa ser encontrada e chamada rápido: falar no WhatsApp, traçar a rota e conferir o horário.',
    summary:
      'Site da Jane Materiais para Construção, em Guariba (SP). Leva o cliente da busca ao balcão, com WhatsApp em destaque, rota no Google Maps, horário de funcionamento, avaliações e galeria.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion'],
    url: 'https://janemateriais-opal.vercel.app/',
    layout: 'mirror',
    atmosphere: { base: '#0a1711', glow: '#2e8a5a', accent: '#ef4a4f' },
    shots: {
      primary: {
        src: 'jane-hero',
        kind: 'desktop',
        alt: 'Página inicial da Jane Materiais: fundo verde, logotipo e o título "Tudo para sua obra. Confiança em cada etapa."',
      },
      secondary: {
        src: 'jane-loja',
        kind: 'desktop',
        alt: 'Seção da Jane Materiais com o título "Sua obra merece começar bem." e foto de tijolos.',
      },
      mobile: {
        src: 'jane-mobile',
        kind: 'mobile',
        alt: 'Jane Materiais no celular, com os botões "Fale pelo WhatsApp" e "Como chegar".',
      },
    },
    details: [
      {
        label: 'Foco do site',
        items: [
          'Contato direto pelo WhatsApp.',
          'Rota até a loja pelo Google Maps.',
          'Horário de funcionamento.',
          'Avaliações e galeria.',
        ],
      },
      {
        label: 'Loja',
        items: ['Avenida José Zanotto, 706 — Jardim Hortencia, Guariba (SP).'],
      },
      {
        label: 'Stack identificada no build publicado',
        items: ['React com Vite.', 'Tailwind CSS.', 'Framer Motion.', 'Lucide para os ícones.'],
      },
    ],
  },
  {
    slug: 'sistemas',
    name: 'PROJETOS DE SISTEMAS E AUTOMAÇÃO',
    kicker: 'Desktop · Dados · Integrações',
    problem: 'A operação de um comércio não pode parar: vender, registrar e integrar dados todos os dias.',
    summary:
      'Experiência com sistemas em Delphi, bancos de dados, operações de PDV e integrações entre serviços. Projetos sem página pública para visitar.',
    tech: ['Delphi', 'Bancos de dados'],
    layout: 'schematic',
    atmosphere: { base: '#070914', glow: '#2b5bd7', accent: '#ef3b3b' },
    shots: {},
    details: [
      {
        label: 'Áreas de atuação',
        items: [
          'Sistemas desktop em Delphi.',
          'Bancos de dados e consultas.',
          'Operações de PDV (ponto de venda).',
          'Integrações entre sistemas e serviços.',
        ],
      },
    ],
    note: 'Sem link público. O diagrama desta seção é ilustrativo e não representa um sistema específico.',
  },
]

export function shotSrcSet(shot: ProjectShot): string {
  return SHOT_WIDTHS[shot.kind].map((width) => `/projects/${shot.src}-${width}.webp ${width}w`).join(', ')
}

export function shotFallback(shot: ProjectShot): string {
  const widths = SHOT_WIDTHS[shot.kind]
  return `/projects/${shot.src}-${widths[widths.length - 1]}.webp`
}
