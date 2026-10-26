import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { SHOT_SIZE, shotFallback, shotSrcSet } from '../../config/projects'
import type { ProjectShot } from '../../config/projects'
import { cn } from '../../lib/utils'
import { Lock } from '../Icons'

interface FrameProps {
  shot: ProjectShot
  host?: string
  sizes: string
  className?: string
  /** Intensidade do parallax interno (em %). */
  drift?: number
  accent: string
}

function useDrift(from: number, to: number) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : [`${from}%`, `${to}%`])
  return { ref, y }
}

/** Janela de navegador com a captura real do site. */
export function BrowserFrame({ shot, host, sizes, className, drift = 4, accent }: FrameProps) {
  const { ref, y } = useDrift(-drift, drift)
  const { width, height } = SHOT_SIZE[shot.kind]

  return (
    <div ref={ref} className={cn('overflow-hidden border border-paper/12 bg-graphite shadow-[0_40px_120px_-40px_rgb(0_0_0/0.8)]', className)}>
      <div className="flex h-8 items-center gap-3 border-b border-paper/10 px-3 font-mono text-[0.65rem] text-paper/45">
        <span className="flex gap-1" aria-hidden>
          <span className="h-1.5 w-1.5 bg-paper/20" />
          <span className="h-1.5 w-1.5 bg-paper/20" />
          <span className="h-1.5 w-1.5" style={{ backgroundColor: accent }} />
        </span>
        {host ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <Lock size={10} />
            <span className="truncate">{host}</span>
          </span>
        ) : null}
      </div>
      <div className="relative overflow-hidden" style={{ aspectRatio: shot.aspect ? String(shot.aspect) : `${width} / ${height}` }}>
        <motion.img
          src={shotFallback(shot)}
          srcSet={shotSrcSet(shot)}
          sizes={sizes}
          width={width}
          height={height}
          alt={shot.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-x-0 top-[-6%] h-[112%] w-full object-cover object-top"
          style={{ y }}
        />
      </div>
    </div>
  )
}

/** Moldura de celular com a captura mobile. */
export function PhoneFrame({ shot, sizes, className, drift = 5 }: Omit<FrameProps, 'host' | 'accent'>) {
  const { ref, y } = useDrift(0, -drift)
  const { width, height } = SHOT_SIZE[shot.kind]

  return (
    <div
      ref={ref}
      className={cn('overflow-hidden rounded-[1.75rem] border border-paper/15 bg-graphite p-1.5 shadow-[0_40px_100px_-30px_rgb(0_0_0/0.9)]', className)}
    >
      <div className="relative overflow-hidden rounded-[1.35rem]" style={{ aspectRatio: '9 / 17' }}>
        <motion.img
          src={shotFallback(shot)}
          srcSet={shotSrcSet(shot)}
          sizes={sizes}
          width={width}
          height={height}
          alt={shot.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-x-0 top-0 h-auto w-full"
          style={{ y }}
        />
      </div>
    </div>
  )
}
