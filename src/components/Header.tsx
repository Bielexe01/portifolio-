import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { observedSectionIds, sections } from '../config/navigation'
import { contactLinks, profile } from '../config/profile'
import { scrollToSection, useActiveSection } from '../hooks'
import { cn } from '../lib/utils'
import { ArrowUpRight, Close } from './Icons'
import { Modal } from './Modal'

export function Header() {
  const active = useActiveSection(observedSectionIds)
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 })
  const percent = useTransform(scrollYProgress, (value) => `${String(Math.round(value * 100)).padStart(3, '0')}%`)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pendingTarget = useRef<string | null>(null)

  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 24))

  const activeMeta = sections.find((section) => section.id === active)

  const goTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    scrollToSection(id)
  }

  const goToFromMenu = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    pendingTarget.current = id
    setMenuOpen(false)
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-500',
          scrolled ? 'border-paper/10 bg-ink/85 backdrop-blur-md' : 'border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1680px] items-center justify-between gap-6 px-5 md:px-10">
          <a href="#inicio" onClick={(event) => goTo(event, 'inicio')} className="group flex items-center gap-3" aria-label={`${profile.shortName}, voltar ao início`}>
            <span className="grid h-8 w-8 place-items-center border border-paper/20 font-mono text-[0.7rem] font-medium tracking-wider transition-colors group-hover:border-accent group-hover:text-accent">
              {profile.initials}
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:block">{profile.shortName}</span>
          </a>

          <nav aria-label="Seções" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {sections.map((section) => {
                const isActive = section.id === active
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(event) => goTo(event, section.id)}
                      aria-current={isActive ? 'location' : undefined}
                      className={cn(
                        'group relative flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                        isActive ? 'text-paper' : 'text-paper/55 hover:text-paper',
                      )}
                    >
                      <span className={cn('font-mono text-[0.65rem] transition-colors', isActive ? 'text-accent' : 'text-paper/35 group-hover:text-paper/60')}>{section.code}</span>
                      {section.label}
                      <span
                        aria-hidden
                        className={cn('absolute inset-x-3 -bottom-px h-px origin-left bg-accent transition-transform duration-500', isActive ? 'scale-x-100' : 'scale-x-0')}
                      />
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <p className="hidden items-center gap-3 label text-mute md:flex" aria-hidden>
              <span className="text-paper/40">{activeMeta?.title ?? 'INDEX'}</span>
              <motion.span className="tabular-nums text-paper">{percent}</motion.span>
            </p>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              className="group flex h-10 items-center gap-3 border border-paper/20 px-4 label transition-colors hover:border-accent hover:text-accent lg:hidden"
            >
              Menu
              <span aria-hidden className="flex w-4 flex-col gap-[5px]">
                <span className="h-px w-full bg-current" />
                <span className="h-px w-2/3 bg-current transition-[width] group-hover:w-full" />
              </span>
            </button>
          </div>
        </div>
        <motion.div aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent" style={{ scaleX: progress }} />
      </header>

      <Modal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onClosed={() => {
          if (pendingTarget.current) scrollToSection(pendingTarget.current)
          pendingTarget.current = null
        }}
        labelledBy="menu-title"
        className="menu-sheet h-dvh w-screen"
      >
        <div className="blueprint flex h-full flex-col bg-ink px-5 pb-8 pt-5">
          <div className="flex items-center justify-between">
            <p id="menu-title" className="label text-mute">
              <span className="text-accent">●</span> Navegação
            </p>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-10 items-center gap-2 border border-paper/20 px-4 label hover:border-accent hover:text-accent"
            >
              Fechar <Close size={14} />
            </button>
          </div>

          <nav aria-label="Seções" className="mt-12 flex-1">
            <ul className="border-t border-paper/10">
              <li className="border-b border-paper/10">
                <a href="#inicio" onClick={(event) => goToFromMenu(event, 'inicio')} className="flex items-baseline gap-4 py-4">
                  <span className="font-mono text-xs text-paper/40">00</span>
                  <span className="display text-[2.6rem]">Início</span>
                </a>
              </li>
              {sections.map((section) => (
                <li key={section.id} className="border-b border-paper/10">
                  <a
                    href={`#${section.id}`}
                    onClick={(event) => goToFromMenu(event, section.id)}
                    aria-current={section.id === active ? 'location' : undefined}
                    className="group flex items-baseline gap-4 py-4"
                  >
                    <span className={cn('font-mono text-xs', section.id === active ? 'text-accent' : 'text-paper/40')}>{section.code}</span>
                    <span className="display text-[2.6rem] transition-colors group-hover:text-accent">{section.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="mt-8 grid gap-3 label">
            <li>
              <a href={contactLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-paper/70 hover:text-accent">
                GitHub <ArrowUpRight size={14} />
              </a>
            </li>
            <li>
              <a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-paper/70 hover:text-accent">
                LinkedIn <ArrowUpRight size={14} />
              </a>
            </li>
            {contactLinks.whatsapp ? (
              <li>
                <a href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-paper/70 hover:text-accent">
                  WhatsApp <ArrowUpRight size={14} />
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </Modal>
    </>
  )
}
