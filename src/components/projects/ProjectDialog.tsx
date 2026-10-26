import type { Project } from '../../config/projects'
import { displayHost } from '../../lib/links'
import { ArrowUpRight, Close } from '../Icons'
import { Modal } from '../Modal'

interface ProjectDialogProps {
  project: Project | null
  open: boolean
  onClose: () => void
}

export function ProjectDialog({ project, open, onClose }: ProjectDialogProps) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="detalhes-titulo" className="m-auto w-[min(100%-1.5rem,46rem)]">
      {project ? (
        <div className="flex max-h-[88dvh] flex-col border border-paper/15 bg-graphite shadow-[0_60px_160px_-40px_rgb(0_0_0/0.9)]">
          <header className="flex items-start justify-between gap-6 border-b border-paper/10 p-5 md:p-7">
            <div>
              <p className="label text-mute">
                <span style={{ color: project.atmosphere.accent }}>■</span> Detalhes técnicos · {project.kicker}
              </p>
              <h2 id="detalhes-titulo" className="display mt-3 text-[clamp(1.9rem,6vw,3.25rem)] leading-[0.92]">
                {project.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              autoFocus
              className="flex h-10 shrink-0 items-center gap-2 border border-paper/20 px-3 label hover:border-accent hover:text-accent"
            >
              <span className="hidden sm:inline">Fechar</span>
              <Close size={14} />
              <span className="sr-only sm:hidden">Fechar</span>
            </button>
          </header>

          <div className="overflow-y-auto overscroll-contain p-5 md:p-7">
            <p className="text-lg leading-snug md:text-xl">{project.problem}</p>
            <p className="mt-4 leading-relaxed text-mute">{project.summary}</p>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {project.details?.map((detail) => (
                <section key={detail.label} aria-label={detail.label}>
                  <h3 className="label text-paper/45">{detail.label}</h3>
                  <ul className="mt-3 space-y-2 border-l border-paper/10 pl-4 text-[0.95rem] text-paper/85">
                    {detail.items.map((item) => (
                      <li key={item} className="relative">
                        <span aria-hidden className="absolute -left-[1.1rem] top-[0.6em] h-px w-2 bg-accent/70" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            {project.note ? (
              <p className="mt-8 border border-paper/10 bg-ink/50 p-4 font-mono text-[0.75rem] leading-relaxed text-paper/60">
                <span className="text-accent">NOTA ·</span> {project.note}
              </p>
            ) : null}
          </div>

          <footer className="flex flex-col gap-3 border-t border-paper/10 p-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
            <ul className="flex flex-wrap gap-2" aria-label="Tecnologias">
              {project.tech.map((tech) => (
                <li key={tech} className="border border-paper/15 px-2 py-0.5 font-mono text-[0.68rem] text-paper/70">
                  {tech}
                </li>
              ))}
            </ul>
            {project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-11 items-center justify-between gap-3 bg-paper px-4 text-ink transition-colors hover:bg-accent"
              >
                <span className="label text-[0.7rem] font-medium">{displayHost(project.url)}</span>
                <ArrowUpRight size={15} />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            ) : (
              <span className="label text-paper/40">Sem link público</span>
            )}
          </footer>
        </div>
      ) : null}
    </Modal>
  )
}
