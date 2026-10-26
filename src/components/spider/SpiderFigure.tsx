import { useId } from 'react'
import type { ReactNode } from 'react'
import { spiderColors as c } from '../../config/spider'
import type { SpiderPose } from '../../config/spider'
import { webPath } from '../../lib/spider'
import { cn } from '../../lib/utils'

const HEAD_WEB = webPath({ radius: 24, spokes: 10, rings: 3, sag: 0.12 })
const CHEST_WEB = webPath({ radius: 22, spokes: 8, rings: 2, sag: 0.1 })

/** Pose da viagem (segurando a teia) mais as poses de parada. */
export type FigurePose = SpiderPose | 'swing'

/**
 * Ponto de apoio de cada pose, em unidades do desenho (largura 60):
 * swing = mãos; hang = pés, presos ao fio; sit = quadril, na borda;
 * peek = queixo, na borda.
 */
export const FIGURE_FRAME: Record<FigurePose, { rootX: number; rootY: number; height: number; centerY: number }> = {
  swing: { rootX: 30, rootY: 0, height: 92, centerY: 46 },
  hang: { rootX: 30, rootY: 0, height: 92, centerY: 50 },
  sit: { rootX: 30, rootY: 60, height: 92, centerY: 34 },
  peek: { rootX: 30, rootY: 38, height: 42, centerY: 20 },
}

interface SpiderFigureProps {
  width: number
  pose: FigurePose
  /** Olhos apertados, como quando ele fala. */
  squint?: boolean
  className?: string
}

/** Mascote desenhado à mão, numa das poses. */
export function SpiderFigure({ width, pose, squint = false, className }: SpiderFigureProps) {
  const id = useId().replace(/:/g, '')
  const frame = FIGURE_FRAME[pose]
  const height = Math.round((width * frame.height) / 60)

  return (
    <svg
      aria-hidden
      viewBox={`0 0 60 ${frame.height}`}
      width={width}
      height={height}
      className={cn('block overflow-visible drop-shadow-[0_8px_14px_rgb(0_0_0/0.45)]', className)}
    >
      <g stroke={c.ink} strokeLinejoin="round">
        {pose === 'swing' ? (
          <>
            <ArmsUp />
            <Legs />
            <Torso id={id} />
            <Head id={id} squint={squint} />
            <Hand x={27.4} y={2.6} />
            <Hand x={32.6} y={2.6} />
          </>
        ) : null}

        {pose === 'hang' ? (
          // Desenhado em pé e girado: pés no fio, braços pendendo abaixo da cabeça.
          <g transform="rotate(180 30 46)">
            <ArmsSpread />
            <Legs />
            <Torso id={id} />
            <Head id={id} squint={squint} />
            <Hand x={8.5} y={14.5} />
            <Hand x={51.5} y={14.5} />
          </g>
        ) : null}

        {pose === 'sit' ? (
          <>
            <SitLegs />
            <ArmsDown />
            <Torso id={id} />
            <Head id={id} squint={squint} />
            <Hand x={11.5} y={60} />
            <Hand x={48.5} y={60} />
          </>
        ) : null}

        {pose === 'peek' ? (
          <>
            <Head id={id} squint={squint} look />
            <Grip x={13} />
            <Grip x={47} />
          </>
        ) : null}
      </g>
    </svg>
  )
}

function Arm({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} strokeWidth="7" />
      <path d={d} stroke={c.red} strokeWidth="4.6" />
    </g>
  )
}

function ArmsUp() {
  return (
    <>
      <Arm d="M19 41 Q5 24 27.4 3" />
      <Arm d="M41 41 Q55 24 32.6 3" />
      <Stripe d="M18 39 Q11 28 12.2 21" />
      <Stripe d="M42 39 Q49 28 47.8 21" />
    </>
  )
}

function ArmsSpread() {
  return (
    <>
      <Arm d="M19 41 Q9.5 35 8.5 17" />
      <Arm d="M41 41 Q50.5 35 51.5 17" />
      <Stripe d="M17 39.5 Q11 35.5 10.5 28" />
      <Stripe d="M43 39.5 Q49 35.5 49.5 28" />
    </>
  )
}

function ArmsDown() {
  return (
    <>
      <Arm d="M19 41 Q12 46 11.5 57" />
      <Arm d="M41 41 Q48 46 48.5 57" />
    </>
  )
}

function Stripe({ d }: { d: string }) {
  return <path d={d} fill="none" stroke={c.blue} strokeWidth="1.6" strokeLinecap="round" />
}

function Hand({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="3.2" fill={c.red} strokeWidth="1.3" />
}

/** Mãos agarradas na borda, com os dedos por cima. */
function Grip({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 5} y={33.5} width="10" height="7" rx="3" fill={c.red} strokeWidth="1.3" />
      <path d={`M${x - 1.7} 34 V38.5 M${x + 1.7} 34 V38.5`} fill="none" stroke={c.redDark} strokeWidth="0.8" />
    </g>
  )
}

function Legs() {
  return (
    <>
      <path d="M22 59 L29 59 L28.6 81 L23 81 Z" fill={c.blue} strokeWidth="1.3" />
      <path d="M31 59 L38 59 L37 81 L31.4 81 Z" fill={c.blue} strokeWidth="1.3" />
      <path d="M23 80 L28.6 80 L29.2 90 Q26 92 21.8 90.2 Z" fill={c.red} strokeWidth="1.3" />
      <path d="M31.4 80 L37 80 L38.2 90.2 Q34 92 30.8 90 Z" fill={c.red} strokeWidth="1.3" />
    </>
  )
}

/** Sentado: coxas curtas (vindo para a frente) e canelas balançando. */
function SitLegs() {
  return (
    <>
      <Shin className="spider-kick" x={25.5} />
      <Shin className="spider-kick spider-kick--late" x={34.5} />
      <ellipse cx="25.5" cy="64" rx="4.4" ry="3.6" fill={c.blue} strokeWidth="1.3" />
      <ellipse cx="34.5" cy="64" rx="4.4" ry="3.6" fill={c.blue} strokeWidth="1.3" />
    </>
  )
}

function Shin({ x, className }: { x: number; className: string }): ReactNode {
  return (
    <g className={className} style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}>
      <path d={`M${x - 3.2} 64 L${x + 3.2} 64 L${x + 2.8} 80 L${x - 2.8} 80 Z`} fill={c.blue} strokeWidth="1.3" />
      <path d={`M${x - 2.9} 79 L${x + 2.9} 79 L${x + 3.6} 87.5 Q${x} 89.6 ${x - 3.8} 87.8 Z`} fill={c.red} strokeWidth="1.3" />
    </g>
  )
}

function Torso({ id }: { id: string }) {
  const clip = `spider-chest-${id}`
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <path d="M22 38.5 Q30 36.5 38 38.5 L35.5 58 L24.5 58 Z" />
        </clipPath>
      </defs>
      <path d="M16.5 39.5 Q30 35 43.5 39.5 L40.5 60.5 L19.5 60.5 Z" fill={c.blue} strokeWidth="1.3" />
      <path d="M22 38.5 Q30 36.5 38 38.5 L35.5 58 L24.5 58 Z" fill={c.red} strokeWidth="0.9" />
      <g clipPath={`url(#${clip})`}>
        <path d={CHEST_WEB} transform="translate(30 46)" fill="none" stroke={c.redDark} strokeWidth="0.5" />
      </g>
      <path d="M19.8 57.6 L40.2 57.6 L40 60.8 L20 60.8 Z" fill={c.red} strokeWidth="1" />
    </>
  )
}

function Head({ id, squint, look = false }: { id: string; squint: boolean; look?: boolean }) {
  const clip = `spider-head-${id}`
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <ellipse cx="30" cy="22" rx="15" ry="16.5" />
        </clipPath>
      </defs>
      <ellipse cx="30" cy="22" rx="15" ry="16.5" fill={c.red} strokeWidth="1.5" />
      <g clipPath={`url(#${clip})`}>
        <path d={HEAD_WEB} transform="translate(30 27)" fill="none" stroke={c.redDark} strokeWidth="0.55" />
      </g>
      <g className={look ? 'spider-look' : undefined}>
        <g
          fill={c.eye}
          strokeWidth="1.9"
          className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transformBox: 'fill-box', transformOrigin: '50% 50%', transform: squint ? 'scaleY(0.45)' : 'scaleY(1)' }}
        >
          <path d="M16.5 18 Q22 14.5 27 21.5 Q22 25.5 17.5 23 Q15.6 20.6 16.5 18 Z" />
          <path d="M43.5 18 Q38 14.5 33 21.5 Q38 25.5 42.5 23 Q44.4 20.6 43.5 18 Z" />
        </g>
      </g>
    </>
  )
}
