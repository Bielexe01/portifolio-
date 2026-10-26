import { useInView } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { MaskLines, Reveal, SectionLabel } from '../components/Motion'
import { ProjectChapter } from '../components/projects/ProjectChapter'
import { ProjectDialog } from '../components/projects/ProjectDialog'
import { sectionMeta } from '../config/navigation'
import { projects } from '../config/projects'
import type { Project } from '../config/projects'
import { scrollToSection } from '../hooks'
import { cn } from '../lib/utils'

function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return `rgb(${r} ${g} ${b} / ${alpha})`
}

export function Projects() {
  const meta = sectionMeta('projetos')
  const [active, setActive] = useState(-1)
  const [selected, setSelected] = useState<Project | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const introRef = useRef<HTMLDivElement>(null)
  const introInView = useInView(introRef, { margin: '-50% 0px -50% 0px' })

  useEffect(() => {
    if (introInView) setActive(-1)
  }, [introInView])

  const onActive = useCallback((index: number) => setActive(index), [])
  const openDetails = useCallback((project: Project) => {
    setSelected(project)
    setDialogOpen(true)
  }, [])

  const current = active >= 0 ? projects[active] : undefined

  return (
    <section id="projetos" aria-labelledby="projetos-title" className="relative isolate border-t border-paper/10">
      {/* Atmosfera: cor e luz mudam conforme o capítulo na tela. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="sticky top-0 h-svh overflow-hidden">
          {projects.map((project, index) => (
            <div
              key={project.slug}
              className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
              style={{
                opacity: index === active ? 1 : 0,
                background: `radial-gradient(70% 60% at 75% 25%, ${withAlpha(project.atmosphere.glow, 0.2)}, transparent 70%), radial-gradient(60% 50% at 10% 90%, ${withAlpha(project.atmosphere.glow, 0.08)}, transparent 70%), ${project.atmosphere.base}`,
              }}
            />
          ))}
          <div className="blueprint absolute inset-0 opacity-60" />

          {/* Trilho de capítulos (telas largas). */}
          <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 xl:flex">
            {projects.map((project, index) => (
              <span
                key={project.slug}
                className={cn('w-px transition-all duration-700', index === active ? 'h-10 bg-acid' : 'h-4 bg-paper/20')}
              />
            ))}
          </div>
          <p
            className={cn(
              'absolute bottom-5 right-5 hidden label transition-opacity duration-700 md:block',
              current ? 'opacity-100' : 'opacity-0',
            )}
          >
            <span className="text-paper/35">Capítulo </span>
            <span className="text-paper/80">
              {String(active + 1).padStart(2, '0')}/{String(projects.length).padStart(2, '0')}
            </span>
            <span className="text-paper/35"> · {current?.name}</span>
          </p>
        </div>
      </div>

      <div ref={introRef} className="mx-auto max-w-[1680px] px-5 pb-10 pt-24 md:px-10 md:pt-36">
        <SectionLabel code={meta.code} title={meta.title} aside={`${projects.length} capítulos`} />
        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:items-end">
          <MaskLines
            id="projetos-title"
            className="display text-[clamp(3rem,12.5vw,5.5rem)] md:text-[clamp(4.5rem,9vw,10.5rem)] lg:col-span-8"
            lines={['IDEIAS QUE', 'VIRARAM', <span key="p" className="font-serif font-normal italic tracking-[-0.02em]">PRODUTO.</span>]}
          />
          <Reveal className="lg:col-span-4">
            <nav aria-label="Índice de projetos">
              <ol className="border-t border-paper/10 font-mono text-[0.78rem]">
                {projects.map((project, index) => (
                  <li key={project.slug} className="border-b border-paper/10">
                    <a
                      href={`#projeto-${project.slug}`}
                      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                        event.preventDefault()
                        scrollToSection(`projeto-${project.slug}`)
                      }}
                      className="group flex items-baseline gap-4 py-3 transition-colors hover:text-acid"
                    >
                      <span className="text-paper/35 group-hover:text-acid">{String(index + 1).padStart(2, '0')}</span>
                      <span className="flex-1 truncate">{project.name}</span>
                      <span className="hidden text-paper/35 sm:inline">{project.url ? 'link ↗' : 'sem link'}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>
        </div>
      </div>

      {projects.map((project, index) => (
        <ProjectChapter
          key={project.slug}
          project={project}
          index={index}
          total={projects.length}
          onActive={onActive}
          onOpenDetails={openDetails}
        />
      ))}

      <ProjectDialog project={selected} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </section>
  )
}
