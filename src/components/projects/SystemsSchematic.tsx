import { Reveal } from '../Motion'

interface NodeProps {
  code: string
  title: string
  text: string
  highlight?: boolean
}

function Node({ code, title, text, highlight = false }: NodeProps) {
  return (
    <div className={`relative border bg-ink/80 p-3 md:p-4 ${highlight ? 'border-accent/50' : 'border-paper/15'}`}>
      <span aria-hidden className="absolute -left-px -top-px h-2 w-2 border-l border-t border-accent" />
      <p className="font-mono text-[0.6rem] tracking-[0.14em] text-paper/40">{code}</p>
      <p className="mt-1 text-sm font-semibold tracking-tight md:text-base">{title}</p>
      <p className="mt-1 text-xs leading-snug text-mute md:text-[0.8rem]">{text}</p>
    </div>
  )
}

function VerticalLink() {
  return (
    <div aria-hidden className="relative mx-auto h-10 w-px bg-paper/20 md:h-14">
      <span className="packet-y absolute left-1/2 block h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-accent" />
    </div>
  )
}

/** Diagrama ilustrativo: não representa um sistema específico. */
export function SystemsSchematic() {
  return (
    <Reveal>
      <figure className="blueprint relative border border-paper/12 bg-graphite/50 p-4 sm:p-6 md:p-10">
        <figcaption className="mb-6 flex flex-wrap items-center justify-between gap-2 label md:mb-10">
          <span className="text-accent">Esquema ilustrativo</span>
          <span className="text-paper/40">Não representa um sistema específico</span>
        </figcaption>

        <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] items-center sm:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)]">
          <div className="col-start-1">
            <Node code="N.01" title="PDV" text="Operação de venda no balcão." />
          </div>
          <div className="col-start-1">
            <VerticalLink />
          </div>
          <div className="col-start-1">
            <Node code="N.02" title="Aplicação Delphi" text="Telas e regras de negócio." highlight />
          </div>
          <div aria-hidden className="relative col-start-2 row-start-3 h-px bg-paper/20">
            <span className="packet-x absolute top-1/2 block h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-accent" />
          </div>
          <div className="col-start-3 row-start-3">
            <Node code="N.04" title="Integrações" text="Comunicação com outros sistemas e serviços." />
          </div>
          <div className="col-start-1">
            <VerticalLink />
          </div>
          <div className="col-start-1">
            <Node code="N.03" title="Banco de dados" text="Registro e consulta das informações." />
          </div>
        </div>

        <p className="mt-6 font-mono text-[0.65rem] text-paper/35 md:mt-10">
          PDV → Delphi → banco de dados · Delphi ↔ integrações
        </p>
      </figure>
    </Reveal>
  )
}
