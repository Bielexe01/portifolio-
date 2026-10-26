import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useFinePointer } from '../hooks'
import { cn } from '../lib/utils'

const INTERACTIVE = 'a, button, [role="tab"], [data-cursor]'

interface CursorState {
  hover: boolean
  label: string
}

/** Ponto + anel discretos. Só existe com mouse e sem movimento reduzido. */
export function Cursor() {
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  if (!fine || reduce) return null
  return <CursorInner />
}

function CursorInner() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 520, damping: 42, mass: 0.5 })
  const ringY = useSpring(y, { stiffness: 520, damping: 42, mass: 0.5 })
  const [visible, setVisible] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [state, setState] = useState<CursorState>({ hover: false, label: '' })

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('has-cursor')
    let last: Element | null = null

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      x.set(event.clientX)
      y.set(event.clientY)
      setVisible(true)
      const target = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null
      if (target !== last) {
        last = target
        setState({ hover: Boolean(target), label: target?.getAttribute('data-cursor') ?? '' })
      }
    }
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    const onLeave = () => setVisible(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('pointerleave', onLeave)
    return () => {
      root.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [x, y])

  const ringSize = state.label ? 84 : state.hover ? 46 : 30

  return (
    <div aria-hidden className={cn('custom-cursor pointer-events-none fixed inset-0 z-[80] transition-opacity duration-300', visible ? 'opacity-100' : 'opacity-0')}>
      <motion.div className="absolute left-0 top-0" style={{ x: ringX, y: ringY }}>
        <div
          className={cn(
            'flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
            state.label ? 'border-acid bg-acid text-ink' : state.hover ? 'border-acid/80' : 'border-paper/35',
            pressed && 'scale-90',
          )}
          style={{ width: ringSize, height: ringSize }}
        >
          {state.label ? <span className="label text-[0.625rem] tracking-[0.12em]">{state.label}</span> : null}
        </div>
      </motion.div>
      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <div className={cn('h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper transition-opacity', state.label && 'opacity-0')} />
      </motion.div>
    </div>
  )
}
