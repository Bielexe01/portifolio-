import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useRef } from 'react'
import type { PointerEvent } from 'react'
import { MaskLines } from '../components/Motion'
import { ArrowDown } from '../components/Icons'
import { profile } from '../config/profile'
import { scrollToSection, useFinePointer, useLocalTime } from '../hooks'
import { EASE_CINE } from '../lib/utils'

const FRAGMENTS = [
  { text: 'const ideia = await imaginar()', className: 'left-[6%] top-[22%]', depth: 26 },
  { text: 'git commit -m "primeira versão"', className: 'right-[6%] top-[15%] hidden md:block', depth: -18 },
  { text: '<Interface intent />', className: 'left-[42%] top-[14%] hidden lg:block', depth: 14 },
  { text: 'SELECT * FROM problemas;', className: 'left-[10%] bottom-[30%] hidden lg:block', depth: -30 },
  { text: 'npm run build', className: 'right-[22%] top-[30%] hidden xl:block', depth: 34 },
]

function useDepth(source: MotionValue<number>, depth: number) {
  return useTransform(source, (value) => value * depth)
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const interactive = fine && !reduce

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 50, damping: 18, mass: 0.6 })
  const smoothY = useSpring(pointerY, { stiffness: 50, damping: 18, mass: 0.6 })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, reduce ? 1 : 0])

  const titleX = useDepth(smoothX, -10)
  const titleY = useDepth(smoothY, -6)
  const gridX = useDepth(smoothX, -22)
  const lightX = useDepth(smoothX, 40)
  const lightY = useDepth(smoothY, 20)

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!interactive) return
    const rect = event.currentTarget.getBoundingClientRect()
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2)
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2)
  }

  const onPointerLeave = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <section
      id="inicio"
      ref={ref}
      aria-label="Apresentação"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate flex min-h-svh flex-col overflow-hidden"
    >
      {/* Cena: luz volumétrica, piso em perspectiva e fragmentos de código. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-[30%] left-[38%] h-[120%] w-[70%] origin-top"
          style={{ x: lightX, y: lightY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        >
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,rgb(242_240_234/0.13),transparent_62%)]" />
          <div className="absolute left-1/2 top-0 h-full w-[46%] -translate-x-1/2 bg-[linear-gradient(to_bottom,rgb(242_240_234/0.07),transparent_70%)] blur-2xl [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" />
        </motion.div>

        <motion.div className="absolute inset-x-[-25%] bottom-0 h-[58%]" style={{ x: gridX }}>
          <div className="hero-grid h-full w-full" />
        </motion.div>

        <div className="absolute inset-x-0 bottom-[34%] h-px bg-gradient-to-r from-transparent via-paper/15 to-transparent" />

        {FRAGMENTS.map((fragment, index) => (
          <CodeFragment key={fragment.text} {...fragment} index={index} sourceX={smoothX} sourceY={smoothY} />
        ))}

        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,transparent_40%,var(--color-ink)_85%)]" />
      </div>

      <motion.div
        className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col px-5 pb-6 pt-24 md:px-10 md:pb-8 md:pt-28"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <motion.p
          className="label text-mute"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className="text-acid">//</span> {profile.concept}
        </motion.p>

        <motion.div className="mt-auto pt-10" style={{ x: titleX, y: titleY }}>
          <h1 className="display text-[clamp(2.4rem,12.4vw,4.5rem)] md:text-[clamp(4.5rem,min(10.2vw,19svh),12.5rem)]">
            <span className="sr-only">
              {profile.shortName}, {profile.role}. Eu imagino. Eu desenvolvo. Eu entrego.
            </span>
            <MaskLines
              as="span"
              ariaHidden
              trigger="mount"
              delay={0.15}
              className="block"
              lineClassName={(index) => (index === 2 ? 'md:pl-[16vw]' : '')}
              lines={[
                <HeroLine verb="IMAGINO" key="1" />,
                <HeroLine verb="DESENVOLVO" key="2" />,
                <HeroLine verb="ENTREGO" key="3" accent />,
              ]}
            />
          </h1>
        </motion.div>

        <div className="mt-8 grid gap-8 md:mt-10 lg:grid-cols-12 lg:items-end lg:gap-10">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_CINE, delay: 0.55 }}
          >
            <p className="max-w-md text-lg leading-snug text-paper/85 md:text-xl">
              Transformando problemas reais em sistemas, experiências e produtos digitais.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-semibold">{profile.shortName}</span>
              <span aria-hidden className="h-px w-5 bg-paper/30" />
              <span className="text-mute">{profile.role}</span>
            </div>
            <a
              href="#projetos"
              onClick={(event) => {
                event.preventDefault()
                scrollToSection('projetos')
              }}
              className="group relative mt-7 inline-flex h-14 w-full items-center justify-between gap-6 overflow-hidden bg-paper px-6 text-ink sm:w-auto"
            >
              <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-acid transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100" />
              <span className="relative label text-[0.75rem] font-medium tracking-[0.16em]">Explorar projetos</span>
              <ArrowDown size={18} className="relative transition-transform duration-500 group-hover:translate-y-0.5" />
            </a>
          </motion.div>

          <motion.div
            className="lg:col-span-4 lg:col-start-9"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_CINE, delay: 0.7 }}
          >
            <TechPanel />
          </motion.div>
        </div>

        <a
          href="#perfil"
          onClick={(event) => {
            event.preventDefault()
            scrollToSection('perfil')
          }}
          className="group mt-8 flex items-center gap-3 self-start label text-mute transition-colors hover:text-paper md:mt-10 lg:self-center"
        >
          <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-paper/15">
            <span className="scroll-cue absolute left-0 top-0 block h-4 w-px bg-acid" />
          </span>
          Scroll
          <span className="sr-only">até o perfil</span>
        </a>
      </motion.div>
    </section>
  )
}

interface CodeFragmentProps {
  text: string
  className: string
  depth: number
  index: number
  sourceX: MotionValue<number>
  sourceY: MotionValue<number>
}

function CodeFragment({ text, className, depth, index, sourceX, sourceY }: CodeFragmentProps) {
  const x = useDepth(sourceX, depth)
  const y = useDepth(sourceY, depth * 0.6)
  return (
    <motion.span
      className={`absolute font-mono text-[0.7rem] text-paper/25 ${className}`}
      style={{ x, y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.9 + index * 0.12 }}
    >
      <span className="text-acid/60">›</span> {text}
    </motion.span>
  )
}

function HeroLine({ verb, accent = false }: { verb: string; accent?: boolean }) {
  return (
    <span className="whitespace-nowrap">
      <span className="mr-[0.3em] inline-block align-top font-mono text-[0.26em] font-medium leading-[1.6] tracking-[0.06em] text-paper/55 md:mr-0 md:inline md:align-baseline md:font-sans md:text-[1em] md:font-extrabold md:leading-[inherit] md:tracking-[inherit] md:text-paper">
        EU
      </span>
      <span className="hidden md:inline"> </span>
      {verb}
      <span className={accent ? 'text-acid' : undefined}>.</span>
    </span>
  )
}

function TechPanel() {
  const time = useLocalTime(profile.timeZone)

  return (
    <div className="border border-paper/12 bg-graphite/70 font-mono text-[0.72rem] backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-paper/10 px-4 py-2.5 text-paper/45">
        <span>sys.status</span>
        <span className="flex gap-1" aria-hidden>
          <span className="h-1 w-1 bg-paper/30" />
          <span className="h-1 w-1 bg-paper/30" />
          <span className="h-1 w-3 bg-acid/70" />
        </span>
      </div>
      <div className="px-4 py-3.5">
        <p className="flex items-center gap-2.5 text-acid">
          <span className="status-dot h-2 w-2 rounded-full bg-acid" aria-hidden />
          {profile.availability}
        </p>
        <dl className="mt-3.5 grid grid-cols-[4.75rem_1fr] gap-x-3 gap-y-2 text-paper/80">
          <dt className="text-paper/40">STACK</dt>
          <dd>{profile.heroStack.join(' · ')}</dd>
          <dt className="text-paper/40">BASE</dt>
          <dd>{profile.location}</dd>
          <dt className="text-paper/40">LOCAL</dt>
          <dd className="tabular-nums">
            <time>
              {time.hours}
              <span className="caret">:</span>
              {time.minutes}
            </time>{' '}
            <span className="text-paper/40">GMT-3</span>
          </dd>
        </dl>
      </div>
    </div>
  )
}
