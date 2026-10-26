/**
 * Camada temática do Homem-Aranha: uma homenagem de fã.
 *
 * Frases, citações e cores ficam aqui, num lugar só. O boneco é um desenho
 * próprio (SVG), sem logo, imagem ou arte oficial da Marvel.
 */

export const spiderColors = {
  red: '#e23636',
  redDark: '#a3161d',
  blue: '#2b5bd7',
  blueDark: '#1a3a91',
  ink: '#070914',
  eye: '#f7f6f1',
} as const

/** Falas do mascote, uma por clique, sem repetir a anterior. */
export const spiderPhrases: readonly string[] = [
  'Thwip! Deploy feito.',
  'Sentido aranha: tem um bug por perto.',
  'Pendurado aqui esperando o build.',
  'Nenhum console.error foi ferido.',
  'Com grandes poderes vêm grandes pull requests.',
  'Teia firme. Código tipado.',
  'Clica de novo. Tenho mais frases.',
  'Seu amigo da vizinhança, desenvolvedor.',
]

export const spiderQuotes = {
  responsibility: 'Com grandes poderes vêm grandes responsabilidades.',
  neighborhood: 'Seu amigo da vizinhança, desenvolvedor.',
} as const

/** Recado para quem abre o console do navegador. */
export const spiderConsole = {
  title: 'Thwip! Você achou o console.',
  body: 'Sentido aranha aprovado. Este site foi feito com React, Vite, TypeScript, Tailwind CSS e Framer Motion.',
  link: 'Código e projetos: https://github.com/Bielexe01',
} as const

/**
 * Como ele fica em cada parada:
 * - hang: pendurado de cabeça para baixo num fio, abaixo do ponto;
 * - sit: sentado na borda de cima, com as pernas balançando;
 * - peek: só a cabeça e as mãos, espiando por cima da borda.
 */
export type SpiderPose = 'hang' | 'sit' | 'peek'

export interface SpiderStation {
  /** Nome curto da parada (usado em testes). */
  id: string
  /** Elemento da página onde ele pousa (seletor CSS). */
  target: string
  pose: SpiderPose
  /** Ponto no elemento, de 0 a 1: x da esquerda para a direita, y de cima para baixo. */
  x: number
  y: number
  /** Usa só a área do texto, não a caixa inteira (bom para títulos). */
  text?: boolean
  /** Fala ao chegar, uma vez por visita. */
  say?: string
}

/**
 * Paradas, na ordem da página. Ao rolar, quando a parada atual sai da tela,
 * ele lança a teia e vai para a parada visível mais perto do meio da tela.
 * Para adicionar uma parada, basta um item novo aqui.
 */
export const spiderStations: readonly SpiderStation[] = [
  { id: 'inicio', target: '[data-perch="inicio"]', pose: 'hang', x: 0.62, y: 0.42, say: 'Thwip! Role a página e me siga.' },
  { id: 'perfil', target: '#perfil figure', pose: 'peek', x: 0.82, y: 0, say: 'Esse é o Vitor por trás do código.' },
  { id: 'projetos', target: '#projetos nav ol', pose: 'hang', x: 0.86, y: 1, say: 'Quatro destes estão no ar.' },
  { id: 'drop-titulo', target: '#projeto-drop-coffee h3', pose: 'sit', x: 0.86, y: 0, text: true },
  { id: 'drop-link', target: '#projeto-drop-coffee a[target="_blank"]', pose: 'peek', x: 0.78, y: 0, say: 'Esse está no ar. Pode clicar.' },
  { id: 'nyvora-titulo', target: '#projeto-nyvora h3', pose: 'peek', x: 0.9, y: 0, text: true },
  { id: 'nyvora-link', target: '#projeto-nyvora a[target="_blank"]', pose: 'peek', x: 0.22, y: 0 },
  { id: 'motors-titulo', target: '#projeto-motors h3', pose: 'sit', x: 0.08, y: 0, text: true },
  { id: 'motors-link', target: '#projeto-motors a[target="_blank"]', pose: 'peek', x: 0.8, y: 0 },
  { id: 'jane-titulo', target: '#projeto-jane h3', pose: 'peek', x: 0.12, y: 0, text: true },
  { id: 'jane-link', target: '#projeto-jane a[target="_blank"]', pose: 'peek', x: 0.8, y: 0 },
  { id: 'sistemas-esquema', target: '#projeto-sistemas figure', pose: 'sit', x: 0.9, y: 0 },
  { id: 'sistemas-detalhes', target: '#projeto-sistemas button[aria-haspopup="dialog"]', pose: 'peek', x: 0.8, y: 0, say: 'Sem link público. Os detalhes estão aqui.' },
  { id: 'processo', target: '[data-perch="processo"]', pose: 'sit', x: 0.72, y: 0, say: 'Grandes poderes, grandes responsabilidades.' },
  { id: 'stack', target: '[data-perch="stack"]', pose: 'peek', x: 0.86, y: 0, say: 'Veja como o Vitor usa cada tecnologia.' },
  { id: 'contato', target: '[data-perch="contato"]', pose: 'peek', x: 0.62, y: 0, say: 'Bora construir algo?' },
]
