import { spiderColors, spiderConsole } from '../config/spider'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export interface Point {
  x: number
  y: number
}

export interface Box {
  left: number
  top: number
  width: number
  height: number
}

/** Linha vazia, fora da tela: nada aparece. */
export const NO_LINE = 'M-99 -99'

/**
 * Ponto da parada dentro de uma caixa (coordenadas da tela). O x fica
 * dentro da tela, com folga para o boneco inteiro aparecer.
 */
export function stationPoint(box: Box, at: { x: number; y: number }, viewportWidth: number, halfWidth: number): Point {
  const min = halfWidth + 8
  const max = Math.max(min, viewportWidth - halfWidth - 8)
  return {
    x: clamp(box.left + box.width * clamp(at.x, 0, 1), min, max),
    y: box.top + box.height * clamp(at.y, 0, 1),
  }
}

export interface Candidate {
  index: number
  /** Altura do ponto na tela. NaN quando o alvo não existe ou está oculto. */
  y: number
}

export interface Band {
  top: number
  bottom: number
  /** Linha da tela que ele prefere quando precisa trocar. */
  focus: number
}

/**
 * Escolhe a parada. Ele fica na atual enquanto ela aparece na faixa da
 * tela; quando ela sai, vai para a parada visível mais perto do foco.
 * Sem nenhuma visível, continua onde está.
 */
export function pickStation(candidates: readonly Candidate[], current: number, band: Band): number {
  const visible = candidates.filter((candidate) => Number.isFinite(candidate.y) && candidate.y >= band.top && candidate.y <= band.bottom)
  if (visible.length === 0) return current
  if (visible.some((candidate) => candidate.index === current)) return current
  let best = visible[0] as Candidate
  for (const candidate of visible) {
    if (Math.abs(candidate.y - band.focus) < Math.abs(best.y - band.focus)) best = candidate
  }
  return best.index
}

/** Ponto na viagem: um arco curto para cima, como um puxão de teia. */
export function zipPoint(from: Point, to: Point, t: number): Point {
  const u = clamp(Number.isFinite(t) ? t : 0, 0, 1)
  const dx = to.x - from.x
  const dy = to.y - from.y
  const lift = Math.min(160, Math.hypot(dx, dy) * 0.22)
  const cx = from.x + dx / 2
  const cy = from.y + dy / 2 - lift
  const a = (1 - u) * (1 - u)
  const b = 2 * (1 - u) * u
  const c = u * u
  return { x: a * from.x + b * cx + c * to.x, y: a * from.y + b * cy + c * to.y }
}

/** Duração da viagem, em segundos: mais longe, um pouco mais lenta. */
export function zipDuration(from: Point, to: Point): number {
  return clamp(0.32 + Math.hypot(to.x - from.x, to.y - from.y) / 1900, 0.42, 0.9)
}

/** Giro (graus) para as mãos apontarem do ponto atual até o alvo. */
export function aimAngle(from: Point, to: Point): number {
  return (Math.atan2(to.x - from.x, -(to.y - from.y)) * 180) / Math.PI
}

/** Ponto entre dois pontos (0 = início, 1 = fim). */
export function lerpPoint(from: Point, to: Point, t: number): Point {
  const u = clamp(t, 0, 1)
  return { x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u }
}

/** Linha reta para um path SVG. */
export function linePath(from: Point, to: Point): string {
  return `M${round(from.x)} ${round(from.y)}L${round(to.x)} ${round(to.y)}`
}

/** Próxima frase. Começa pela primeira e nunca repete a atual. */
export function nextPhraseIndex(current: number, total: number, random: () => number = Math.random): number {
  if (total <= 1 || current < 0) return 0
  const step = 1 + Math.floor(clamp(random(), 0, 0.999999) * (total - 1))
  return (current + step) % total
}

export interface WebOptions {
  /** Raio da teia, em unidades do SVG. */
  radius: number
  /** Quantidade de raios. */
  spokes?: number
  /** Quantidade de anéis. */
  rings?: number
  /** Quanto cada fio do anel cede para o centro (0 a 1). */
  sag?: number
  /** Ângulo inicial, em graus. */
  from?: number
  /** Ângulo final, em graus. 360 fecha o círculo. */
  to?: number
}

const round = (value: number) => {
  const rounded = Math.round(value * 100) / 100
  return Object.is(rounded, -0) ? 0 : rounded
}

/** Teia (raios + anéis curvos) centrada em (0, 0), como um path SVG. */
export function webPath({ radius, spokes = 8, rings = 3, sag = 0.16, from = 0, to = 360 }: WebOptions): string {
  const count = Math.max(2, Math.round(spokes))
  const span = to - from
  const closed = Math.abs(span) >= 360
  const step = closed ? span / count : span / (count - 1)
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const angles = Array.from({ length: count }, (_, index) => toRad(from + step * index))
  const point = (r: number, angle: number) => `${round(r * Math.cos(angle))} ${round(r * Math.sin(angle))}`

  const parts = angles.map((angle) => `M0 0L${point(radius, angle)}`)
  const segments = closed ? count : count - 1
  const halfStep = toRad(step) / 2

  for (let ring = 1; ring <= rings; ring++) {
    const r = (radius * ring) / rings
    let d = `M${point(r, angles[0] ?? 0)}`
    for (let index = 0; index < segments; index++) {
      const start = angles[index] ?? 0
      const end = angles[(index + 1) % count] ?? 0
      d += `Q${point(r * (1 - sag), start + halfStep)} ${point(r, end)}`
    }
    parts.push(d)
  }

  return parts.join('')
}

/** Riscos em zigue-zague em volta de um centro: o "sentido aranha". */
export function senseLines(count: number, inner: number, outer: number, center = 0): string {
  const parts: string[] = []
  const total = Math.max(1, Math.round(count))
  for (let index = 0; index < total; index++) {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2
    const dx = Math.cos(angle)
    const dy = Math.sin(angle)
    const at = (r: number, side: number) => `${round(center + dx * r - dy * side)} ${round(center + dy * r + dx * side)}`
    const third = (outer - inner) / 3
    parts.push(`M${at(inner, 0)}L${at(inner + third, 1.6)}L${at(inner + third * 2, -1.6)}L${at(outer, 0)}`)
  }
  return parts.join('')
}

let greeted = false

/** Recado no console, uma vez por carregamento. */
export function greetSpiderFans(log: (...args: unknown[]) => void = console.log): boolean {
  if (greeted) return false
  greeted = true
  log(
    `%c${spiderConsole.title}\n%c${spiderConsole.body}\n${spiderConsole.link}`,
    `font: 800 18px/1.6 system-ui, sans-serif; color: ${spiderColors.red}; text-shadow: 2px 0 ${spiderColors.blue};`,
    'font: 12px/1.6 ui-monospace, monospace; color: inherit;',
  )
  return true
}
