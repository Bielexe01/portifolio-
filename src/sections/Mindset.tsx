import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { MaskLines, Reveal, SectionLabel } from '../components/Motion'
import { sectionMeta } from '../config/navigation'
import { processSteps } from '../config/process'
import { spiderQuotes } from '../config/spider'
import { EASE_CINE, cn } from '../lib/utils'

export function Mindset() {
  const meta = sectionMeta('processo')
  const [active, setActive] = useState(0)
  const tabs = useRef<Array<HTMLButtonElement | null>>([])
  const step = processSteps[active] ?? processSteps[0]!
  const last = processSteps.length - 1
  const progress = active / last

  const select = (index: number, focus = false) => {
    const next = (index + processSteps.length) % processSteps.length
    setActive(next)
    if (focus) tabs.current[next]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowDown: active + 1,
      ArrowLeft: active - 1,
      ArrowUp: active - 1,
      Home: 0,
      End: last,
    }
    const target = keys[event.key]
    if (target === undefined) return
    event.preventDefault()
    select(target, true)
  }

  return (
    <section id="processo" aria-labelledby="processo-title" className="relative border-t border-paper/10 py-24 md:py-36">
      <div className="mx-auto max-w-[1680px] px-5 md:px-10">
        <SectionLabel code={meta.code} title={meta.title} aside="pipeline.run()" />

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:items-end">
          <MaskLines
            id="processo-title"
            className="display text-[clamp(2.9rem,12vw,5.5rem)] md:text-[clamp(4.5rem,8.6vw,10rem)] lg:col-span-8"
            lines={["BEAUTIFUL", <span key="2" className="font-serif font-normal italic tracking-[-0.02em]">ISN'T ENOUGH.</span>]}
          />
          <Reveal className="lg:col-span-4">
            <p className="text-xl leading-snug md:text-2xl">
              Uma interface pode impressionar. <span className="text-mute">Um sistema precisa funcionar.</span> Meu objetivo é unir os
              dois.
            </p>
            <div className="mt-6 flex items-center gap-3 label text-paper/45" aria-hidden>
              <span className="border border-accent-blue/40 px-2 py-1 text-accent-blue">Interface</span>
              <span>↔</span>
              <span className="border border-accent/40 px-2 py-1 text-accent">Sistema</span>
            </div>
            <p className="mt-6 max-w-sm font-serif text-lg italic leading-snug text-paper/70 md:text-xl">
              <span aria-hidden className="mr-2 font-mono text-[0.7rem] not-italic text-accent">//</span>
              {spiderQuotes.responsibility}
            </p>
          </Reveal>
        </div>

        {/* Diagrama: etapas conectadas por uma linha que avança. */}
        <Reveal className="mt-16 md:mt-24">
          <div data-perch="processo" className="relative border border-paper/10 bg-graphite/40">
            <div className="flex items-center justify-between border-b border-paper/10 px-4 py-3 label text-paper/45 md:px-6">
              <span>process.flow</span>
              <span className="tabular-nums">
                Etapa <span className="text-paper">{step.code}</span> / 0{processSteps.length}
              </span>
            </div>

            <div className="px-4 py-6 md:px-6 md:py-10">
              <div className="relative">
                {/* Linha de conexão: vertical no celular, horizontal no desktop. */}
                <div aria-hidden className="absolute bottom-[1.125rem] left-[1.125rem] top-[1.125rem] w-px bg-paper/12 lg:hidden">
                  <motion.div
                    className="absolute inset-0 origin-top bg-accent"
                    initial={false}
                    animate={{ scaleY: progress }}
                    transition={{ duration: 0.8, ease: EASE_CINE }}
                  />
                </div>
                <div
                  aria-hidden
                  className="absolute top-[1.125rem] hidden h-px bg-paper/12 lg:block"
                  style={{ left: 'calc((100% - 5rem) / 12)', right: 'calc((100% - 5rem) / 12)' }}
                >
                  <motion.div
                    className="absolute inset-0 origin-left bg-accent"
                    initial={false}
                    animate={{ scaleX: progress }}
                    transition={{ duration: 0.8, ease: EASE_CINE }}
                  />
                </div>

                <div role="tablist" aria-label="Etapas do processo" className="relative grid gap-3 lg:grid-cols-6 lg:gap-4">
                {processSteps.map((item, index) => {
                  const isActive = index === active
                  const done = index < active
                  return (
                    <button
                      key={item.code}
                      ref={(element) => {
                        tabs.current[index] = element
                      }}
                      type="button"
                      role="tab"
                      id={`etapa-${item.code}`}
                      aria-selected={isActive}
                      aria-controls="etapa-painel"
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => select(index)}
                      onKeyDown={onKeyDown}
                      onMouseEnter={() => select(index)}
                      className="group flex items-center gap-4 text-left lg:flex-col lg:items-center lg:gap-4 lg:text-center"
                    >
                      <span
                        className={cn(
                          'relative grid h-9 w-9 shrink-0 place-items-center border font-mono text-[0.7rem] transition-colors duration-500 lg:h-[2.25rem] lg:w-[2.25rem]',
                          isActive ? 'border-accent bg-accent text-ink' : done ? 'border-accent/60 bg-ink text-accent' : 'border-paper/20 bg-ink text-paper/50 group-hover:border-paper/50',
                        )}
                      >
                        {item.code}
                        {isActive ? <span aria-hidden className="absolute -inset-1.5 border border-accent/30" /> : null}
                      </span>
                      <span className={cn('text-sm leading-tight transition-colors md:text-base', isActive ? 'text-paper' : 'text-paper/55 group-hover:text-paper/80')}>
                        {item.title}
                      </span>
                    </button>
                  )
                })}
                </div>
              </div>
            </div>

            <div
              id="etapa-painel"
              role="tabpanel"
              aria-labelledby={`etapa-${step.code}`}
              className="grid min-h-[13rem] gap-6 border-t border-paper/10 p-5 md:grid-cols-12 md:p-8"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step.code}
                  className="md:col-span-12 md:grid md:grid-cols-12 md:gap-6"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: EASE_CINE }}
                >
                  <p aria-hidden className="display text-[5rem] leading-none text-paper/10 md:col-span-2 md:text-[7rem]">
                    {step.code}
                  </p>
                  <div className="md:col-span-6">
                    <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">{step.title}</h3>
                    <p className="mt-3 max-w-xl leading-relaxed text-mute md:text-lg">{step.text}</p>
                  </div>
                  <div className="mt-5 md:col-span-4 md:mt-0">
                    <p className="label text-paper/40">Saída da etapa</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {step.tags.map((tag) => (
                        <li key={tag} className="border border-paper/15 px-2.5 py-1 font-mono text-[0.72rem] text-paper/75">
                          {tag}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex gap-2">
                      <button
                        type="button"
                        onClick={() => select(active - 1)}
                        className="h-10 border border-paper/20 px-4 label transition-colors hover:border-accent hover:text-accent"
                      >
                        ← Anterior
                      </button>
                      <button
                        type="button"
                        onClick={() => select(active + 1)}
                        className="h-10 border border-paper/20 px-4 label transition-colors hover:border-accent hover:text-accent"
                      >
                        {active === last ? 'Recomeçar ↺' : 'Próxima →'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
