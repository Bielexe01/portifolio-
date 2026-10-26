import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { webPath } from '../../lib/spider'

const SPLAT = webPath({ radius: 24, spokes: 8, rings: 3, sag: 0.22 })
const MAX_SHOTS = 4
const LIFETIME = 950

interface Shot {
  id: number
  x: number
  y: number
  fromX: number
  fromY: number
}

/**
 * Cada clique do mouse lança um fio da mão do mascote até o ponto clicado,
 * onde abre uma teia que some. Não bloqueia cliques: é só visual.
 */
export function WebShots({ origin }: { origin: RefObject<HTMLElement | null> }) {
  const [shots, setShots] = useState<Shot[]>([])
  const counter = useRef(0)

  useEffect(() => {
    const timers = new Set<number>()

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      if (document.documentElement.classList.contains('modal-open')) return
      if (event.target instanceof Element && event.target.closest('[data-spider]')) return

      const rect = origin.current?.getBoundingClientRect()
      const fromX = rect ? rect.left + rect.width / 2 : window.innerWidth - 40
      const fromY = rect ? rect.top + rect.height * 0.08 : 0
      const id = ++counter.current

      setShots((list) => [...list.slice(-(MAX_SHOTS - 1)), { id, x: event.clientX, y: event.clientY, fromX, fromY }])
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        setShots((list) => list.filter((shot) => shot.id !== id))
      }, LIFETIME)
      timers.add(timer)
    }

    window.addEventListener('pointerdown', onDown, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', onDown)
      for (const timer of timers) window.clearTimeout(timer)
    }
  }, [origin])

  return (
    <svg aria-hidden className="pointer-events-none fixed inset-0 z-[70] h-full w-full overflow-visible">
      {shots.map((shot) => (
        <g key={shot.id}>
          <motion.path
            d={`M${shot.fromX} ${shot.fromY}L${shot.x} ${shot.y}`}
            fill="none"
            stroke="rgb(242 240 234 / 0.75)"
            strokeWidth={1.2}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 1 }}
            animate={{ pathLength: 1, opacity: 0 }}
            transition={{ pathLength: { duration: 0.16, ease: 'easeOut' }, opacity: { duration: 0.45, delay: 0.22 } }}
          />
          <g transform={`translate(${shot.x} ${shot.y})`}>
            <motion.path
              d={SPLAT}
              fill="none"
              stroke="rgb(242 240 234 / 0.85)"
              strokeWidth={1}
              strokeLinecap="round"
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [0.2, 1.1, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, delay: 0.12, times: [0, 0.3, 1], ease: 'easeOut' }}
            />
          </g>
        </g>
      ))}
    </svg>
  )
}
