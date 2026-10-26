import { useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { MaskLines, Reveal, SectionLabel } from '../components/Motion'
import { sectionMeta } from '../config/navigation'
import { techGroups } from '../config/stack'
import type { Tech, TechGroup } from '../config/stack'
import { cn } from '../lib/utils'

type Line = { text: ReactNode; item?: Tech }

/** Monta as linhas do "arquivo" conforme a extensão. */
function buildLines(group: TechGroup): Line[] {
  const ext = group.file.split('.').pop()
  const varName = group.id
  const str = (value: string) => <span className="text-[#e6d8a8]">'{value}'</span>
  const kw = (value: string) => <span className="text-[#b9aaff]">{value}</span>
  const comment = (value: string) => <span className="text-paper/30">{value}</span>

  if (ext === 'sql') {
    return [
      { text: comment(`-- ${group.label}`) },
      { text: <>{kw('SELECT')} nome {kw('FROM')} stack</> },
      { text: <>{kw('WHERE')} nome {kw('IN')} (</> },
      ...group.items.map((item, index) => ({
        text: <>{'  '}{str(item.name)}{index < group.items.length - 1 ? ',' : ''}</>,
        item,
      })),
      { text: ');' },
    ]
  }
  if (ext === 'md') {
    return [
      { text: <span className="text-accent/80"># {group.label}</span> },
      { text: '' },
      ...group.items.map((item) => ({ text: <>{comment('-')} {item.name}</>, item })),
    ]
  }
  if (ext === 'yml') {
    return [
      { text: comment(`# ${group.label}`) },
      { text: <>{kw(varName)}:</> },
      ...group.items.map((item) => ({ text: <>{'  '}{comment('-')} {str(item.name)}</>, item })),
    ]
  }
  return [
    { text: comment(`// ${group.label}`) },
    { text: <>{kw('export const')} {varName} = [</> },
    ...group.items.map((item) => ({ text: <>{'  '}{str(item.name)},</>, item })),
    { text: <>] {kw('as const')}</> },
  ]
}

export function TechStack() {
  const meta = sectionMeta('stack')
  const [groupIndex, setGroupIndex] = useState(0)
  const group = techGroups[groupIndex] ?? techGroups[0]!
  const [selected, setSelected] = useState<Tech>(group.items[0]!)
  const tabs = useRef<Array<HTMLButtonElement | null>>([])
  const lines = buildLines(group)
  const selectedLine = lines.findIndex((line) => line.item?.name === selected.name) + 1

  const openGroup = (index: number, focus = false) => {
    const next = (index + techGroups.length) % techGroups.length
    const nextGroup = techGroups[next]!
    setGroupIndex(next)
    setSelected(nextGroup.items[0]!)
    if (focus) tabs.current[next]?.focus()
  }

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const map: Record<string, number> = {
      ArrowDown: groupIndex + 1,
      ArrowRight: groupIndex + 1,
      ArrowUp: groupIndex - 1,
      ArrowLeft: groupIndex - 1,
      Home: 0,
      End: techGroups.length - 1,
    }
    const target = map[event.key]
    if (target === undefined) return
    event.preventDefault()
    openGroup(target, true)
  }

  return (
    <section id="stack" aria-labelledby="stack-title" className="relative border-t border-paper/10 py-24 md:py-36">
      <div className="mx-auto max-w-[1680px] px-5 md:px-10">
        <SectionLabel code={meta.code} title={meta.title} aside="stack.workspace" />

        <div className="mt-14 grid gap-8 lg:mt-20 lg:grid-cols-12 lg:items-end">
          <MaskLines
            id="stack-title"
            className="display text-[clamp(2.9rem,12vw,5.5rem)] md:text-[clamp(4.5rem,8.6vw,10rem)] lg:col-span-7"
            lines={['FERRAMENTAS', <span key="2" className="font-serif font-normal italic tracking-[-0.02em]">em uso.</span>]}
          />
          <Reveal className="lg:col-span-4 lg:col-start-9">
            <p className="leading-relaxed text-mute md:text-lg">
              Abra um arquivo e passe o mouse, toque ou navegue com o teclado por uma tecnologia para ver o que ela é e onde entra
              na prática.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-14 md:mt-20">
          <div data-perch="stack" className="overflow-hidden border border-paper/12 bg-[#0b0f20] font-mono text-[0.8rem] shadow-[0_50px_140px_-60px_rgb(0_0_0/0.9)]">
            {/* Barra de título */}
            <div className="flex items-center justify-between gap-4 border-b border-paper/10 bg-graphite px-4 py-2.5 text-[0.7rem] text-paper/45">
              <span className="flex items-center gap-2">
                <span aria-hidden className="h-2 w-2 bg-accent/80" />
                vitor-gabriel / stack
              </span>
              <span className="hidden sm:inline">{group.file}</span>
              <span>main</span>
            </div>

            <div className="grid lg:grid-cols-[15rem_minmax(0,1fr)_20rem]">
              {/* Explorer */}
              <div className="border-b border-paper/10 lg:border-b-0 lg:border-r">
                <p className="hidden px-4 pb-2 pt-4 text-[0.65rem] tracking-[0.14em] text-paper/35 lg:block">EXPLORER · STACK/</p>
                <div
                  role="tablist"
                  aria-label="Grupos de tecnologias"
                  aria-orientation="vertical"
                  className="no-scrollbar flex overflow-x-auto lg:flex-col lg:pb-4"
                >
                  {techGroups.map((item, index) => {
                    const isActive = index === groupIndex
                    return (
                      <button
                        key={item.id}
                        ref={(element) => {
                          tabs.current[index] = element
                        }}
                        type="button"
                        role="tab"
                        id={`stack-tab-${item.id}`}
                        aria-selected={isActive}
                        aria-controls="stack-editor"
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => openGroup(index)}
                        onKeyDown={onTabKey}
                        className={cn(
                          'flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-left transition-colors lg:border-b-0 lg:border-l-2 lg:py-2',
                          isActive ? 'border-accent bg-paper/[0.04] text-paper' : 'border-transparent text-paper/50 hover:text-paper/80',
                        )}
                      >
                        <span aria-hidden className={isActive ? 'text-accent' : 'text-paper/30'}>
                          {isActive ? '▾' : '▸'}
                        </span>
                        <span>
                          <span className="block">{item.file}</span>
                          <span className="hidden font-sans text-[0.72rem] text-paper/40 lg:block">{item.label}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Editor */}
              <div id="stack-editor" role="tabpanel" aria-labelledby={`stack-tab-${group.id}`} className="min-w-0">
                <div className="flex border-b border-paper/10 text-[0.72rem]">
                  <span className="border-r border-paper/10 border-t-2 border-t-accent bg-[#0b0f20] px-4 py-2 text-paper/80">{group.file}</span>
                  <span className="flex-1 bg-graphite/60" />
                </div>
                <ol className="overflow-x-auto py-4" aria-label={`Tecnologias: ${group.label}`}>
                  {lines.map((line, index) => {
                    const item = line.item
                    const isSelected = item?.name === selected.name
                    return (
                      <li key={`${group.id}-${index}`} className={cn('flex min-h-7 items-center', isSelected && 'bg-accent/[0.07]')}>
                        <span aria-hidden className={cn('w-12 shrink-0 select-none pr-4 text-right tabular-nums', isSelected ? 'text-accent' : 'text-paper/25')}>
                          {index + 1}
                        </span>
                        {item ? (
                          <button
                            type="button"
                            aria-current={isSelected ? 'true' : undefined}
                            onMouseEnter={() => setSelected(item)}
                            onFocus={() => setSelected(item)}
                            onClick={() => setSelected(item)}
                            className="min-h-7 whitespace-pre rounded-none pr-4 text-left text-paper/85 outline-offset-0 hover:text-paper"
                          >
                            {line.text}
                            <span className="sr-only">: {item.description}</span>
                          </button>
                        ) : (
                          <span aria-hidden className="whitespace-pre text-paper/70">
                            {line.text}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </div>

              {/* Inspector */}
              <aside aria-label="Inspector" className="border-t border-paper/10 bg-graphite/50 p-5 lg:border-l lg:border-t-0">
                <p className="text-[0.65rem] tracking-[0.14em] text-paper/35">INSPECTOR</p>
                <div aria-live="polite" className="mt-4">
                  <p className="font-sans text-3xl font-bold tracking-tight text-paper">{selected.name}</p>
                  <p className="mt-1 text-[0.7rem] text-accent">{group.label}</p>
                  <dl className="mt-6 space-y-5 font-sans">
                    <div>
                      <dt className="font-mono text-[0.65rem] tracking-[0.14em] text-paper/40">O QUE É</dt>
                      <dd className="mt-1.5 leading-relaxed text-paper/85">{selected.description}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[0.65rem] tracking-[0.14em] text-paper/40">NA PRÁTICA</dt>
                      <dd className="mt-1.5 leading-relaxed text-paper/85">{selected.practice}</dd>
                    </div>
                  </dl>
                </div>
              </aside>
            </div>

            {/* Barra de status */}
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-paper/10 bg-graphite px-4 py-2 text-[0.68rem] text-paper/45">
              <span className="flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                {group.items.length} itens · {group.label}
              </span>
              <span className="flex gap-4">
                <span>Ln {selectedLine}</span>
                <span className="hidden sm:inline">UTF-8</span>
                <span>pt-BR</span>
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
