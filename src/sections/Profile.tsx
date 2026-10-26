import { MaskLines, Reveal, SectionLabel } from '../components/Motion'
import { sectionMeta } from '../config/navigation'
import { profile } from '../config/profile'
import { profileTags, techGroups } from '../config/stack'

const PRACTICE = [
  {
    title: 'Suporte técnico',
    text: 'Atendimento e diagnóstico de problemas reais de quem usa a tecnologia no dia a dia.',
  },
  {
    title: 'Infraestrutura',
    text: 'Configuração e manutenção do ambiente que mantém os sistemas funcionando.',
  },
  {
    title: 'Desenvolvimento de sistemas',
    text: 'Aplicações web e desktop, da interface ao banco de dados e às integrações.',
  },
]

export function Profile() {
  const meta = sectionMeta('perfil')

  return (
    <section id="perfil" aria-labelledby="perfil-title" className="relative border-t border-paper/10 py-24 md:py-36">
      <div className="mx-auto max-w-[1680px] px-5 md:px-10">
        <SectionLabel code={meta.code} title={meta.title} aside="whoami" />

        <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-10">
          {/* Coluna estreita: terminal com a identidade. */}
          <Reveal className="order-2 lg:order-1 lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Terminal />
              <p className="mt-6 hidden max-w-xs font-serif text-2xl italic leading-tight text-paper/50 lg:block">
                Lógica, arquitetura de software e experiência visual.
              </p>
            </div>
          </Reveal>

          {/* Coluna larga: título editorial, texto e habilidades. */}
          <div className="order-1 lg:order-2 lg:col-span-7 lg:col-start-6">
            <MaskLines
              id="perfil-title"
              className="display text-[clamp(3rem,11vw,5rem)] md:text-[clamp(4.5rem,8.4vw,9.5rem)]"
              lines={[
                'POR TRÁS',
                <>
                  DO <span className="font-serif font-normal italic tracking-[-0.02em]">CÓDIGO.</span>
                </>,
              ]}
            />

            <Reveal delay={0.1}>
              <p className="mt-10 max-w-2xl text-xl leading-relaxed text-paper/85 md:text-2xl md:leading-snug">
                Sou Vitor Gabriel, desenvolvedor e estudante de Análise e Desenvolvimento de Sistemas. Trabalho com tecnologia,
                desenvolvimento de aplicações e criação de soluções digitais, unindo lógica, arquitetura de software e
                experiência visual.
              </p>
            </Reveal>

            <div className="mt-16">
              <p className="label text-mute">Experiência prática</p>
              <ol className="mt-5 border-t border-paper/10">
                {PRACTICE.map((item, index) => (
                  <Reveal as="li" key={item.title} delay={index * 0.06} className="group grid gap-2 border-b border-paper/10 py-5 sm:grid-cols-[3rem_14rem_1fr] sm:items-baseline sm:gap-6">
                    <span className="font-mono text-xs text-paper/35 transition-colors group-hover:text-acid">0{index + 1}</span>
                    <span className="text-lg font-semibold tracking-tight">{item.title}</span>
                    <span className="text-mute">{item.text}</span>
                  </Reveal>
                ))}
              </ol>
            </div>

            <div className="mt-16">
              <p className="label text-mute">Habilidades</p>
              <dl className="mt-5 grid gap-px overflow-hidden border border-paper/10 bg-paper/10 sm:grid-cols-2">
                {techGroups.map((group, index) => (
                  <Reveal key={group.id} delay={index * 0.05} className={`bg-ink p-5 ${index === techGroups.length - 1 ? 'sm:col-span-2' : ''}`}>
                    <dt className="flex items-center justify-between label text-paper/45">
                      {group.profileLabel}
                      <span className="text-paper/25">{group.file}</span>
                    </dt>
                    <dd className="mt-4">
                      <ul className="flex flex-wrap gap-2">
                        {profileTags(group).map((tag) => (
                          <li
                            key={tag}
                            className="border border-paper/15 px-3 py-1.5 text-sm text-paper/85 transition-colors hover:border-acid/70 hover:text-paper"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Terminal() {
  const rows: Array<[string, string]> = [
    ['nome', profile.fullName],
    ['função', profile.role],
    ['formação', profile.education],
    ['base', profile.location],
    ['status', 'available'],
  ]

  return (
    <figure className="border border-paper/12 bg-graphite font-mono text-[0.78rem] leading-relaxed">
      <figcaption className="flex items-center justify-between border-b border-paper/10 px-4 py-2.5 text-paper/45">
        <span>~/vitor — terminal</span>
        <span aria-hidden>80×24</span>
      </figcaption>
      <div className="overflow-x-auto px-4 py-4">
        <p>
          <span className="text-acid">$</span> whoami
        </p>
        <p className="text-paper/70">vitor-gabriel</p>
        <p className="mt-3">
          <span className="text-acid">$</span> cat perfil.json
        </p>
        <pre className="mt-1 whitespace-pre-wrap text-paper/70">
          {'{\n'}
          {rows.map(([key, value], index) => (
            <span key={key}>
              {'  '}
              <span className="text-paper/45">"{key}"</span>: <span className={key === 'status' ? 'text-acid' : 'text-paper'}>"{value}"</span>
              {index < rows.length - 1 ? ',' : ''}
              {'\n'}
            </span>
          ))}
          {'}'}
        </pre>
        <p className="mt-3">
          <span className="text-acid">$</span> <span className="caret inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-paper/80" aria-hidden />
        </p>
      </div>
    </figure>
  )
}
