import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import type { AnimationPlaybackControls } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { spiderPhrases, spiderStations } from '../../config/spider'
import type { SpiderStation } from '../../config/spider'
import { useFinePointer, useMediaQuery } from '../../hooks'
import type { Box, Point } from '../../lib/spider'
import { NO_LINE, aimAngle, greetSpiderFans, lerpPoint, linePath, nextPhraseIndex, pickStation, stationPoint, zipDuration, zipPoint } from '../../lib/spider'
import { FIGURE_FRAME, SpiderFigure } from './SpiderFigure'
import type { FigurePose } from './SpiderFigure'
import { WebShots } from './WebShots'

const PHRASE_TIME = 3600
const ARRIVAL_TIME = 2800
const SHOOT_TIME = 0.16

/** Mascote, teias do clique e recado no console. */
export function SpiderLayer() {
  const reduce = useReducedMotion() ?? false
  const fine = useFinePointer()
  const desktop = useMediaQuery('(min-width: 768px)')
  const figureRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    greetSpiderFans()
  }, [])

  return (
    <>
      <Mascot key={`${desktop}-${reduce}`} desktop={desktop} reduce={reduce} figureRef={figureRef} />
      {fine && !reduce ? <WebShots origin={figureRef} /> : null}
    </>
  )
}

/** Caixa do alvo na tela, ou null se ele não existe ou está oculto. */
function measureBox(station: SpiderStation): Box | null {
  const element = document.querySelector(station.target)
  if (!element) return null
  let rect: Box = element.getBoundingClientRect()
  if (station.text) {
    // Só a primeira linha do texto, e já no topo das letras (sem a folga da linha).
    const range = document.createRange()
    range.selectNodeContents(element)
    const rects = [...range.getClientRects()].filter((item) => item.width > 0 && item.height > 0)
    if (rects.length > 0) {
      const size = Number.parseFloat(getComputedStyle(element).fontSize) || 16
      const top = Math.min(...rects.map((item) => item.top))
      const line = rects.filter((item) => item.top < top + size * 0.4)
      const left = Math.min(...line.map((item) => item.left))
      const right = Math.max(...line.map((item) => item.right))
      const bottom = Math.max(...line.map((item) => item.bottom))
      const inset = size * 0.17
      rect = { left, top: top + inset, width: right - left, height: Math.max(1, bottom - top - inset) }
    }
  }
  if (rect.width === 0 && rect.height === 0) return null
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
}

interface Bubble {
  key: number
  text: string
}

interface MascotProps {
  desktop: boolean
  reduce: boolean
  figureRef: RefObject<HTMLButtonElement | null>
}

function Mascot({ desktop, reduce, figureRef }: MascotProps) {
  const width = desktop ? 56 : 34
  const scale = width / 60
  const thread = desktop ? 34 : 22

  // Posição do ponto de apoio, em coordenadas da página (rola junto com o conteúdo).
  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const rotate = useMotionValue(0)
  const squash = useMotionValue(1)
  const web = useMotionValue(NO_LINE)

  const [pose, setPose] = useState<FigurePose>('swing')
  const [stationIndex, setStationIndex] = useState(-1)
  const [hangAt, setHangAt] = useState<Point | null>(null)
  const [bubble, setBubble] = useState<Bubble | null>(null)
  const [announce, setAnnounce] = useState('')

  const current = useRef(-1)
  const position = useRef<Point | null>(null)
  const travel = useRef<AnimationPlaybackControls | null>(null)
  const traveling = useRef(false)
  const followFrame = useRef(0)
  const resyncRef = useRef<() => void>(() => {})
  const timers = useRef(new Set<number>())
  const said = useRef(new Set<string>())
  const lastPhrase = useRef(-1)
  const bubbleCount = useRef(0)

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
  }, [])

  const showBubble = useCallback(
    (text: string, ms: number) => {
      const key = ++bubbleCount.current
      setBubble({ key, text })
      later(() => setBubble((value) => (value?.key === key ? null : value)), ms)
    },
    [later],
  )

  /** Ponto da parada na página (não na tela). */
  const spotOf = useCallback(
    (station: SpiderStation): Point | null => {
      const box = measureBox(station)
      if (!box) return null
      const point = stationPoint(box, station, document.documentElement.clientWidth, width / 2)
      return { x: point.x + window.scrollX, y: point.y + window.scrollY }
    },
    [width],
  )

  /** Coloca o boneco parado na parada, sem viagem. */
  const settle = useCallback(
    (station: SpiderStation, spot: Point, bounce: boolean) => {
      web.set(NO_LINE)
      rotate.set(0)
      setPose(station.pose)
      x.set(spot.x)
      if (station.pose === 'hang') {
        setHangAt(spot)
        const root = spot.y + thread
        position.current = { x: spot.x, y: root }
        if (bounce) {
          y.set(spot.y)
          animate(y, root, { type: 'spring', stiffness: 260, damping: 11 })
        } else {
          y.set(root)
        }
      } else {
        setHangAt(null)
        position.current = spot
        y.set(spot.y)
        if (bounce) animate(squash, [0.82, 1.06, 1], { duration: 0.42, ease: 'easeOut' })
      }
    },
    [rotate, squash, thread, web, x, y],
  )

  /** Acompanha o alvo a cada quadro, por um tempo. */
  const followFor = useCallback((ms: number) => {
    cancelAnimationFrame(followFrame.current)
    const until = performance.now() + ms
    const step = () => {
      resyncRef.current()
      if (performance.now() < until) followFrame.current = requestAnimationFrame(step)
    }
    followFrame.current = requestAnimationFrame(step)
  }, [])

  /** Lança a teia e viaja até a parada. */
  const goTo = useCallback(
    (index: number) => {
      const station = spiderStations[index]
      if (!station) return
      const spot = spotOf(station)
      if (!spot) return
      current.current = index
      setStationIndex(index)
      setBubble(null)
      cancelAnimationFrame(followFrame.current)
      travel.current?.stop()
      traveling.current = false
      x.stop()
      y.stop()
      squash.stop()

      const arrive = () => {
        traveling.current = false
        settle(station, spot, !reduce)
        if (station.say && !said.current.has(station.id)) {
          said.current.add(station.id)
          showBubble(station.say, ARRIVAL_TIME)
        }
        // Alvos com animação de entrada ainda se mexem: acompanha por um instante.
        followFor(1600)
      }

      const start = position.current
      if (reduce || !start) {
        arrive()
        return
      }

      // Saindo de muito longe (fora da tela), ele entra pela borda mais perto.
      const top = window.scrollY - 140
      const bottom = window.scrollY + window.innerHeight + 140
      const from = { x: start.x, y: Math.min(bottom, Math.max(top, start.y)) }

      setPose('swing')
      setHangAt(null)
      rotate.set(aimAngle(from, spot))
      x.set(from.x)
      y.set(from.y)
      squash.set(1)
      traveling.current = true

      travel.current = animate(0, 1, {
        duration: SHOOT_TIME,
        ease: 'easeOut',
        onUpdate: (k) => web.set(linePath(from, lerpPoint(from, spot, k))),
        onComplete: () => {
          let aim = aimAngle(from, spot)
          travel.current = animate(0, 1, {
            duration: zipDuration(from, spot),
            ease: [0.45, 0, 0.2, 1],
            onUpdate: (t) => {
              const point = zipPoint(from, spot, t)
              x.set(point.x)
              y.set(point.y)
              if (Math.hypot(spot.x - point.x, spot.y - point.y) > 8) aim = aimAngle(point, spot)
              rotate.set(aim)
              web.set(linePath(point, spot))
            },
            onComplete: arrive,
          })
        },
      })
    },
    [followFor, reduce, rotate, settle, showBubble, spotOf, squash, web, x, y],
  )

  /** Mantém o boneco grudado na parada quando o alvo ou a página mudam. */
  const resync = useCallback(() => {
    if (traveling.current) return
    const station = spiderStations[current.current]
    if (!station) return
    const spot = spotOf(station)
    if (!spot) return
    const hang = station.pose === 'hang'
    const target = hang ? { x: spot.x, y: spot.y + thread } : spot
    const now = position.current
    if (now && Math.abs(now.x - target.x) < 1 && Math.abs(now.y - target.y) < 1) return
    y.stop()
    x.set(target.x)
    y.set(target.y)
    position.current = target
    if (hang) setHangAt(spot)
  }, [spotOf, thread, x, y])

  useEffect(() => {
    resyncRef.current = resync
  }, [resync])

  // Confere a rolagem e escolhe a parada.
  useEffect(() => {
    let frame = 0
    const check = () => {
      frame = 0
      const height = window.innerHeight
      const band = desktop
        ? { top: 76, bottom: height * 0.8, focus: height * 0.42 }
        : { top: 70, bottom: height * 0.82, focus: height * 0.42 }
      const candidates = spiderStations.map((station, index) => {
        const box = measureBox(station)
        if (!box) return { index, y: Number.NaN }
        return { index, y: stationPoint(box, station, document.documentElement.clientWidth, width / 2).y }
      })
      const next = pickStation(candidates, current.current, band)
      if (next !== current.current && next >= 0) goTo(next)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    const onResize = () => {
      resync()
      schedule()
    }

    // Entrada: ele chega pela borda de cima, à direita.
    if (!reduce) position.current = { x: document.documentElement.clientWidth + 40 + window.scrollX, y: window.scrollY - 120 }
    const intro = window.setTimeout(check, reduce ? 0 : 450)
    const observer = new ResizeObserver(onResize)
    observer.observe(document.body)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', onResize)
    const pending = timers.current
    return () => {
      window.clearTimeout(intro)
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', onResize)
      travel.current?.stop()
      cancelAnimationFrame(followFrame.current)
      for (const id of pending) window.clearTimeout(id)
      pending.clear()
    }
  }, [desktop, goTo, reduce, resync, width])

  const speak = () => {
    const next = nextPhraseIndex(lastPhrase.current, spiderPhrases.length)
    lastPhrase.current = next
    const text = spiderPhrases[next] ?? ''
    setAnnounce(text)
    showBubble(text, PHRASE_TIME)
  }

  const frame = FIGURE_FRAME[pose]
  const threadLine = useTransform([x, y], ([px, py]) => (hangAt && pose === 'hang' ? linePath(hangAt, { x: Number(px), y: Number(py) }) : NO_LINE))
  const bubbleY = useTransform(y, (value) => value + (frame.centerY - frame.rootY) * scale)
  const side = (x.get() - window.scrollX) > document.documentElement.clientWidth / 2 ? 'left' : 'right'
  const gap = Math.round(width * 0.7)
  const station = spiderStations[stationIndex]

  return (
    <div
      data-spider
      data-station={station?.id ?? ''}
      data-pose={pose}
      className="pointer-events-none absolute left-0 top-0 z-40 h-0 w-0 print:hidden"
    >
      <svg aria-hidden className="absolute left-0 top-0 h-px w-px overflow-visible">
        <motion.path d={web} fill="none" stroke="rgb(244 241 234 / 0.8)" strokeWidth={1.3} strokeLinecap="round" />
        <motion.path d={threadLine} fill="none" stroke="rgb(244 241 234 / 0.55)" strokeWidth={1} />
      </svg>

      {/* Gira em volta do ponto de apoio. */}
      <motion.div className="absolute left-0 top-0 h-0 w-0" style={{ x, y, rotate, transformOrigin: '0px 0px' }}>
        <motion.div
          className={pose === 'hang' && !reduce ? 'spider-sway absolute' : 'absolute'}
          style={{
            left: -frame.rootX * scale,
            top: -frame.rootY * scale,
            width,
            scaleY: squash,
            transformOrigin: `50% ${frame.rootY * scale}px`,
          }}
        >
          <button
            ref={figureRef}
            type="button"
            onClick={speak}
            data-cursor="Thwip"
            aria-label="Homem-Aranha mascote. Clique para ouvir uma frase."
            className="pointer-events-auto block rounded-full transition-transform duration-300 active:scale-95"
          >
            <SpiderFigure width={width} pose={pose} squint={bubble !== null} />
          </button>
        </motion.div>
      </motion.div>

      {/* Balão sem giro, para ler sempre reto. */}
      <motion.div className="absolute left-0 top-0 h-0 w-0" style={{ x, y: bubbleY }}>
        <AnimatePresence>
          {bubble ? (
            <motion.p
              key={bubble.key}
              aria-hidden
              data-side={side}
              className="spider-bubble pointer-events-none absolute top-0 w-max max-w-[11.5rem] -translate-y-1/2 border-2 border-ink bg-paper px-3 py-2 text-left text-[0.78rem] font-bold leading-snug text-ink md:max-w-[15rem] md:text-sm"
              style={side === 'left' ? { right: gap, transformOrigin: '100% 50%' } : { left: gap, transformOrigin: '0% 50%' }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            >
              {bubble.text}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  )
}
