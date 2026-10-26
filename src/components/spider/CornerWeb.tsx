import { motion, useReducedMotion } from 'framer-motion'
import { webPath } from '../../lib/spider'
import { cn } from '../../lib/utils'

const QUARTER = webPath({ radius: 100, spokes: 6, rings: 5, sag: 0.14, from: 0, to: 90 })

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const PLACE: Record<Corner, { className: string; flip: string }> = {
  'top-left': { className: 'left-0 top-0', flip: 'none' },
  'top-right': { className: 'right-0 top-0', flip: 'scaleX(-1)' },
  'bottom-left': { className: 'bottom-0 left-0', flip: 'scaleY(-1)' },
  'bottom-right': { className: 'bottom-0 right-0', flip: 'scale(-1, -1)' },
}

interface CornerWebProps {
  corner: Corner
  className?: string
  delay?: number
  /** Nome da parada do mascote (data-perch). */
  perch?: string
}

/** Teia fina num canto da seção. Desenha-se uma vez ao aparecer. */
export function CornerWeb({ corner, className, delay = 0, perch }: CornerWebProps) {
  const reduce = useReducedMotion()
  const place = PLACE[corner]

  return (
    <svg
      aria-hidden
      data-perch={perch}
      viewBox="0 0 100 100"
      className={cn('pointer-events-none absolute h-40 w-40 overflow-visible md:h-64 md:w-64', place.className, className)}
      style={{ transform: place.flip }}
    >
      {reduce ? (
        <path d={QUARTER} fill="none" stroke="currentColor" strokeWidth={0.42} strokeLinecap="round" />
      ) : (
        <motion.path
          d={QUARTER}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.42}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.4, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </svg>
  )
}
