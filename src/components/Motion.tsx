import { motion } from 'framer-motion'
import type { ElementType, ReactNode } from 'react'
import { EASE_CINE, cn } from '../lib/utils'

const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' } as const

interface MaskLinesProps {
  lines: ReactNode[]
  as?: ElementType
  className?: string
  lineClassName?: string | ((index: number) => string)
  delay?: number
  stagger?: number
  /** 'mount' anima ao carregar (abertura); 'view' anima ao entrar na tela. */
  trigger?: 'mount' | 'view'
  id?: string
  ariaHidden?: boolean
}

/** Revela cada linha de baixo para cima, recortada por uma máscara. */
export function MaskLines({
  lines,
  as: Tag = 'h2',
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  trigger = 'view',
  id,
  ariaHidden,
}: MaskLinesProps) {
  return (
    <Tag className={className} id={id} aria-hidden={ariaHidden || undefined}>
      {lines.map((line, index) => (
        <span key={index} className={cn('mask-line', typeof lineClassName === 'function' ? lineClassName(index) : lineClassName)}>
          <motion.span
            className="block will-change-transform"
            initial={{ y: '108%' }}
            {...(trigger === 'mount' ? { animate: { y: '0%' } } : { whileInView: { y: '0%' }, viewport: VIEWPORT })}
            transition={{ duration: 1.05, ease: EASE_CINE, delay: delay + index * stagger }}
          >
            {line}{' '}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

interface MaskWordsProps {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  id?: string
}

/** Mesma máscara, palavra por palavra (quebra de linha natural). */
export function MaskWords({ text, as: Tag = 'h3', className, delay = 0, id }: MaskWordsProps) {
  const words = text.split(' ')
  return (
    <Tag className={className} id={id} aria-label={text}>
      {words.map((word, index) => (
        <span key={index} aria-hidden className="-my-[0.16em] inline-block overflow-hidden py-[0.16em] align-top">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: '108%' }}
            whileInView={{ y: '0%' }}
            viewport={VIEWPORT}
            transition={{ duration: 1, ease: EASE_CINE, delay: delay + index * 0.06 }}
          >
            {word}
          </motion.span>
        </span>
      )).flatMap((node, index) => (index < words.length - 1 ? [node, ' '] : [node]))}
    </Tag>
  )
}

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  as?: 'div' | 'li' | 'p' | 'span'
}

/** Entrada suave (opacidade + deslocamento) ao aparecer na tela. */
export function Reveal({ children, className, delay = 0, y = 24, as = 'div' }: RevealProps) {
  const Component = motion[as]
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, ease: EASE_CINE, delay }}
    >
      {children}
    </Component>
  )
}

interface SectionLabelProps {
  code: string
  title: string
  className?: string
  aside?: ReactNode
}

/** Cabeçalho técnico de seção: "01 / SYSTEM PROFILE" com fio. */
export function SectionLabel({ code, title, className, aside }: SectionLabelProps) {
  return (
    <div className={cn('flex items-center gap-4 label text-mute', className)}>
      <span className="text-acid">{code}</span>
      <span aria-hidden className="h-px w-8 bg-paper/25" />
      <span>{title}</span>
      <span aria-hidden className="h-px flex-1 bg-paper/10" />
      {aside ? <span className="hidden sm:inline">{aside}</span> : null}
    </div>
  )
}
