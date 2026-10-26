import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { shotFallback, shotSrcSet } from '../../config/projects'
import type { Project, ProjectShot } from '../../config/projects'
import { displayHost } from '../../lib/links'
import { cn } from '../../lib/utils'
import { ArrowUpRight, Plus } from '../Icons'
import { MaskWords, Reveal } from '../Motion'
import { BrowserFrame, PhoneFrame } from './Frames'
import { SystemsSchematic } from './SystemsSchematic'

interface ChapterProps {
  project: Project
  index: number
  total: number
  onActive: (index: number) => void
  onOpenDetails: (project: Project) => void
}

const TITLE_SIZE: Record<Project['layout'], string> = {
  cinema: 'text-[clamp(3rem,15vw,5.5rem)] md:text-[clamp(5rem,14vw,15rem)]',
  split: 'text-[clamp(3rem,16vw,6rem)] md:text-[clamp(4.5rem,8.4vw,10rem)]',
  offset: 'text-[clamp(3rem,16vw,6rem)] md:text-[clamp(5rem,15vw,16rem)]',
  mirror: 'text-[clamp(2.25rem,10.5vw,4rem)] md:text-[clamp(3rem,5vw,6.25rem)]',
  schematic: 'text-[clamp(2.25rem,10vw,4rem)] md:text-[clamp(3rem,4.6vw,5.75rem)]',
}

export function ProjectChapter({ project, index, total, onActive, onOpenDetails }: ChapterProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { margin: '-50% 0px -50% 0px' })

  useEffect(() => {
    if (inView) onActive(index)
  }, [inView, index, onActive])

  const titleId = `projeto-${project.slug}-titulo`
  const style = { '--accent': project.atmosphere.accent } as CSSProperties
  const parts = { project, index, total, titleId, onOpenDetails }

  return (
    <article id={`projeto-${project.slug}`} ref={ref} aria-labelledby={titleId} style={style} className="relative py-20 md:py-32">
      {project.layout === 'cinema' ? <CinemaLayout {...parts} /> : null}
      {project.layout === 'split' ? <SideLayout {...parts} side="right" /> : null}
      {project.layout === 'mirror' ? <SideLayout {...parts} side="left" /> : null}
      {project.layout === 'schematic' ? <SideLayout {...parts} side="right" /> : null}
      {project.layout === 'offset' ? <OffsetLayout {...parts} /> : null}
    </article>
  )
}

interface PartsProps {
  project: Project
  index: number
  total: number
  titleId: string
  onOpenDetails: (project: Project) => void
}

/* ——— Peças compartilhadas ——— */

function ChapterMeta({ project, index, total }: Pick<PartsProps, 'project' | 'index' | 'total'>) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return (
    <Reveal y={12} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 label sm:flex sm:justify-between">
      <span className="flex items-center gap-3 whitespace-nowrap">
        <span className="text-[color:var(--accent)]">{pad(index + 1)}</span>
        <span className="text-paper/30">/ {pad(total)}</span>
        <span aria-hidden className="hidden h-px w-6 bg-paper/25 sm:block" />
        <span className="hidden text-paper/70 sm:inline">{project.kicker}</span>
      </span>
      <span className="truncate text-right text-paper/40">{project.url ? displayHost(project.url) : 'Sem link público'}</span>
      <span className="col-span-2 text-paper/70 sm:hidden">{project.kicker}</span>
    </Reveal>
  )
}

function ChapterTitle({ project, titleId, className }: Pick<PartsProps, 'project' | 'titleId'> & { className?: string }) {
  return <MaskWords as="h3" id={titleId} text={project.name} className={cn('display', TITLE_SIZE[project.layout], className)} />
}

function GhostIndex({ index, className }: { index: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-18%', '18%'])
  return (
    <motion.span
      ref={ref}
      aria-hidden
      style={{ y }}
      className={cn(
        'pointer-events-none absolute select-none font-mono text-[34vw] font-medium leading-none text-transparent [-webkit-text-stroke:1px_rgb(242_240_234/0.07)] md:text-[22vw]',
        className,
      )}
    >
      {String(index + 1).padStart(2, '0')}
    </motion.span>
  )
}

function ChapterBody({ project, onOpenDetails, split = false }: Pick<PartsProps, 'project' | 'onOpenDetails'> & { split?: boolean }) {
  return (
    <div className={cn(split && 'grid gap-10 lg:grid-cols-12')}>
      <Reveal className={cn(split && 'lg:col-span-5')}>
        <p className="label text-mute">
          <span className="text-[color:var(--accent)]">■</span> Problema
        </p>
        <p className="mt-3 text-xl leading-snug text-paper md:text-2xl">{project.problem}</p>
      </Reveal>
      <div className={cn(split ? 'lg:col-span-6 lg:col-start-7' : 'mt-6')}>
        <Reveal delay={0.05}>
          <p className="leading-relaxed text-mute md:text-lg">{project.summary}</p>
        </Reveal>
        <Reveal delay={0.1} className="mt-7">
          <p className="label text-paper/40">Stack</p>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label={`Tecnologias do projeto ${project.name}`}>
            {project.tech.map((tech) => (
              <li key={tech} className="border border-paper/15 bg-ink/40 px-2.5 py-1 font-mono text-[0.72rem] text-paper/80">
                {tech}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.15}>
          <ChapterActions project={project} onOpenDetails={onOpenDetails} />
        </Reveal>
      </div>
    </div>
  )
}

function ChapterActions({ project, onOpenDetails }: Pick<PartsProps, 'project' | 'onOpenDetails'>) {
  if (!project.url && !project.details?.length) return null
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {project.url ? (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="Visitar"
          className="group relative inline-flex h-12 items-center justify-between gap-4 overflow-hidden bg-paper px-5 text-ink"
        >
          <span aria-hidden className="absolute inset-0 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
          <span className="relative label text-[0.72rem] font-medium">Ver projeto</span>
          <ArrowUpRight size={16} className="relative transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          <span className="sr-only">{project.name} (abre em nova aba)</span>
        </a>
      ) : null}
      {project.details?.length ? (
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => onOpenDetails(project)}
          className="group inline-flex h-12 items-center justify-between gap-4 border border-paper/25 px-5 transition-colors hover:border-accent hover:text-accent"
        >
          <span className="label text-[0.72rem] font-medium">Detalhes técnicos</span>
          <Plus size={16} className="transition-transform duration-500 group-hover:rotate-90" />
          <span className="sr-only">de {project.name}</span>
        </button>
      ) : null}
    </div>
  )
}

/** Mídia no celular: captura mobile em moldura de telefone. */
function MobileMedia({ project }: { project: Project }) {
  const shot = project.shots.mobile ?? project.shots.primary
  if (!shot) return null
  if (shot.kind === 'mobile') {
    return <PhoneFrame shot={shot} sizes="(max-width: 767px) 72vw, 1px" className="mx-auto w-[72%] max-w-[300px] md:hidden" />
  }
  return <BrowserFrame shot={shot} sizes="92vw" accent={project.atmosphere.accent} className="md:hidden" />
}

/* ——— Layouts ——— */

/** Faixa de cinema em largura total, título gigante e corpo em duas colunas. */
function CinemaLayout(props: PartsProps) {
  const { project, index } = props
  const { primary, secondary, mobile } = project.shots
  const host = project.url ? displayHost(project.url) : undefined

  return (
    <>
      <div className="relative mx-auto max-w-[1680px] px-5 md:px-10">
        <GhostIndex index={index} className="-top-[0.18em] right-0" />
        <ChapterMeta {...props} />
        <ChapterTitle {...props} className="relative mb-10 mt-8 md:mb-14" />
      </div>

      {primary ? <CinemaBand primary={primary} mobile={mobile} host={host} /> : null}

      <div className="mx-auto mt-12 max-w-[1680px] px-5 md:mt-16 md:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-6">
            <ChapterBody {...props} />
          </div>
          {secondary ? (
            <div className="hidden lg:col-span-5 lg:col-start-8 lg:mt-24 lg:block">
              <BrowserFrame shot={secondary} host={host} sizes="(min-width: 1024px) 40vw, 1px" accent={project.atmosphere.accent} drift={6} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

function CinemaBand({ primary, mobile, host }: { primary: ProjectShot; mobile?: ProjectShot; host?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-7%', '7%'])
  const scale = useTransform(scrollYProgress, [0, 0.5], reduce ? [1, 1] : [1.08, 1])

  return (
    <figure ref={ref} className="relative overflow-hidden border-y border-paper/10">
      <div className="relative aspect-square overflow-hidden sm:aspect-[16/10] md:aspect-[21/9]">
        <motion.picture className="absolute inset-x-0 -top-[8%] block h-[116%]" style={{ y, scale }}>
          {mobile ? <source media="(max-width: 639px)" srcSet={shotSrcSet(mobile)} sizes="100vw" /> : null}
          <img
            src={shotFallback(primary)}
            srcSet={shotSrcSet(primary)}
            sizes="100vw"
            width={1600}
            height={1000}
            alt={mobile ? `${primary.alt} (No celular: ${mobile.alt})` : primary.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-[50%_35%] max-sm:object-top"
          />
        </motion.picture>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(7_9_20/0.35),transparent_25%,transparent_70%,rgb(7_9_20/0.7))]" />
      </div>
      {host ? (
        <figcaption className="absolute bottom-4 left-5 label text-paper/70 md:left-10">
          Captura real · {host}
        </figcaption>
      ) : null}
    </figure>
  )
}

/** Texto de um lado, mídia do outro (usado em split, mirror e schematic). */
function SideLayout(props: PartsProps & { side: 'left' | 'right' }) {
  const { project, index, side } = props
  const { primary, secondary, mobile } = project.shots
  const host = project.url ? displayHost(project.url) : undefined
  const mediaRight = side === 'right'

  return (
    <div className="relative mx-auto max-w-[1680px] px-5 md:px-10">
      <GhostIndex index={index} className={mediaRight ? '-top-[0.25em] left-[30%]' : '-top-[0.25em] right-0'} />
      <ChapterMeta {...props} />
      <div className="relative mt-8 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-12">
        <div className={cn('lg:col-span-5 lg:row-start-1', !mediaRight && 'lg:col-start-8')}>
          <ChapterTitle {...props} />
        </div>

        <div className={cn('relative lg:col-span-7 lg:row-span-2 lg:row-start-1 lg:self-center', mediaRight ? 'lg:col-start-6' : 'lg:col-start-1')}>
          {project.layout === 'schematic' ? (
            <SystemsSchematic />
          ) : (
            <>
              <MobileMedia project={project} />
              {primary ? (
                <div className={cn('relative hidden md:block', mediaRight ? 'lg:pl-[8%]' : 'lg:pr-[10%]')}>
                  <BrowserFrame shot={primary} host={host} sizes="(min-width: 1024px) 54vw, 92vw" accent={project.atmosphere.accent} />
                  {mediaRight && mobile ? (
                    <PhoneFrame
                      shot={mobile}
                      sizes="(min-width: 1024px) 14vw, 1px"
                      className="absolute -bottom-[14%] left-0 hidden w-[24%] lg:block"
                      drift={8}
                    />
                  ) : null}
                  {!mediaRight && secondary ? (
                    <BrowserFrame
                      shot={secondary}
                      host={host}
                      sizes="(min-width: 1024px) 24vw, 1px"
                      accent={project.atmosphere.accent}
                      className="absolute -bottom-[18%] right-0 hidden w-[44%] lg:block"
                      drift={7}
                    />
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className={cn('lg:col-span-5 lg:row-start-2', !mediaRight && 'lg:col-start-8')}>
          <ChapterBody {...props} />
        </div>
      </div>
    </div>
  )
}

/** Título gigante à direita, mídia deslocada em camadas. */
function OffsetLayout(props: PartsProps) {
  const { project, index } = props
  const { primary, secondary } = project.shots
  const host = project.url ? displayHost(project.url) : undefined

  return (
    <div className="relative mx-auto max-w-[1680px] px-5 md:px-10">
      <GhostIndex index={index} className="-top-[0.2em] left-0" />
      <ChapterMeta {...props} />
      <ChapterTitle {...props} className="mt-8 md:text-right" />

      <div className="relative mt-10 md:mt-14">
        <MobileMedia project={project} />
        {primary ? (
          <div className="relative hidden md:block lg:pb-[12%]">
            <BrowserFrame shot={primary} host={host} sizes="(min-width: 1024px) 70vw, 92vw" accent={project.atmosphere.accent} className="lg:w-[72%]" drift={2} />
            {secondary ? (
              <BrowserFrame
                shot={secondary}
                host={host}
                sizes="(min-width: 1024px) 38vw, 1px"
                accent={project.atmosphere.accent}
                className="absolute bottom-0 right-0 hidden w-[40%] lg:block"
                drift={8}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-12 lg:-mt-[6%] lg:w-[48%]">
        <ChapterBody {...props} />
      </div>
    </div>
  )
}
