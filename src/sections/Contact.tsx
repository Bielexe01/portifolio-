import type { MouseEvent, ReactNode } from 'react'
import { ArrowUp, ArrowUpRight, ChatBubble, GitHubMark, LinkedInMark } from '../components/Icons'
import { MaskLines, Reveal, SectionLabel } from '../components/Motion'
import { sectionMeta } from '../config/navigation'
import { contactLinks, profile } from '../config/profile'
import { scrollToSection, useLocalTime } from '../hooks'

interface ContactLink {
  id: string
  label: string
  detail: string
  href: string
  icon: ReactNode
}

export function Contact() {
  const meta = sectionMeta('contato')

  const links: ContactLink[] = [
    ...(contactLinks.whatsapp
      ? [{ id: 'whatsapp', label: 'WhatsApp', detail: 'Conversar agora', href: contactLinks.whatsapp, icon: <ChatBubble size={22} /> }]
      : []),
    { id: 'linkedin', label: 'LinkedIn', detail: contactLinks.linkedinHandle, href: contactLinks.linkedin, icon: <LinkedInMark size={20} /> },
    { id: 'github', label: 'GitHub', detail: contactLinks.githubHandle, href: contactLinks.github, icon: <GitHubMark size={20} /> },
  ]

  return (
    <section id="contato" aria-labelledby="contato-title" className="relative overflow-hidden border-t border-paper/10">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgb(242_240_234/0.06),transparent_70%)]" />

      <div className="mx-auto max-w-[1680px] px-5 pt-24 md:px-10 md:pt-36">
        <SectionLabel code={meta.code} title={meta.title} aside="contato" />

        <MaskLines
          id="contato-title"
          className="display mt-14 text-[clamp(3rem,13vw,6rem)] md:mt-20 md:text-[clamp(5rem,11vw,13rem)]"
          lines={['QUAL É A', <>PRÓXIMA <span className="font-serif font-normal italic tracking-[-0.02em]">IDEIA?</span></>]}
        />

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="max-w-sm text-xl leading-snug md:text-2xl">
              Se existe um problema que merece uma solução melhor, vamos construir algo.
            </p>
            <p className="mt-6 flex items-center gap-2.5 label text-acid">
              <span aria-hidden className="status-dot h-2 w-2 rounded-full bg-acid" />
              {profile.availability}
            </p>
          </Reveal>

          <ul className="border-t border-paper/12 lg:col-span-7 lg:col-start-6">
            {links.map((link, index) => (
              <Reveal as="li" key={link.id} delay={index * 0.06} className="border-b border-paper/12">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="Abrir"
                  className="group relative flex items-center gap-5 overflow-hidden py-6 md:gap-8 md:py-8"
                >
                  <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-paper transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100" />
                  <span className="relative grid h-12 w-12 shrink-0 place-items-center border border-paper/20 transition-colors duration-500 group-hover:border-ink/20 group-hover:text-ink group-focus-visible:text-ink md:h-14 md:w-14">
                    {link.icon}
                  </span>
                  <span className="relative min-w-0 flex-1 transition-colors duration-500 group-hover:text-ink group-focus-visible:text-ink">
                    <span className="block text-3xl font-bold tracking-tight md:text-5xl">{link.label}</span>
                    <span className="mt-1 block truncate font-mono text-xs text-paper/50 transition-colors duration-500 group-hover:text-ink/60 md:text-sm">
                      {link.detail}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={28}
                    className="relative mr-1 shrink-0 transition-[transform,color] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-ink group-focus-visible:text-ink"
                  />
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const time = useLocalTime(profile.timeZone)

  return (
    <footer className="mx-auto max-w-[1680px] px-5 pb-8 pt-24 md:px-10 md:pt-36">
        <p className="display text-center text-[clamp(1.5rem,6.4vw,7.5rem)] leading-[0.9] text-paper/90">
          DESIGNED WITH <span className="font-serif font-normal italic tracking-[-0.02em]">INTENT.</span>
          <br />
          BUILT WITH <span className="text-acid">CODE.</span>
        </p>

        <div className="mt-14 grid gap-4 border-t border-paper/10 pt-6 label text-paper/45 sm:grid-cols-3 sm:items-center">
          <p>
            © {new Date().getFullYear()} {profile.fullName}
          </p>
          <p className="sm:text-center">
            {profile.location} ·{' '}
            <time className="tabular-nums text-paper/70">
              {time.hours}:{time.minutes}
            </time>
          </p>
          <a
            href="#inicio"
            onClick={(event: MouseEvent<HTMLAnchorElement>) => {
              event.preventDefault()
              scrollToSection('inicio')
            }}
            className="group flex items-center gap-2 transition-colors hover:text-acid sm:justify-self-end"
          >
            Voltar ao topo
            <ArrowUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
          </a>
        </div>
    </footer>
  )
}
