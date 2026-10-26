import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  /** Chamado depois que o diálogo terminou de fechar. */
  onClosed?: () => void
  labelledBy: string
  className?: string
  children: ReactNode
}

const CLOSE_MS = 300

/**
 * Diálogo nativo (<dialog> + showModal): prende o foco, fecha com Esc,
 * devolve o foco ao botão de origem e fica acima de tudo.
 */
export function Modal({ open, onClose, onClosed, labelledBy, className, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [closing, setClosing] = useState(false)
  const onClosedRef = useRef(onClosed)
  onClosedRef.current = onClosed

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const root = document.documentElement

    if (open && !dialog.open) {
      dialog.showModal()
      root.classList.add('modal-open')
      return
    }

    if (!open && dialog.open) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setClosing(true)
      const timer = window.setTimeout(
        () => {
          dialog.close()
          setClosing(false)
          root.classList.remove('modal-open')
          onClosedRef.current?.()
        },
        reduce ? 0 : CLOSE_MS,
      )
      return () => window.clearTimeout(timer)
    }
  }, [open])

  useEffect(() => () => document.documentElement.classList.remove('modal-open'), [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      data-closing={closing || undefined}
      className={cn('sheet', className)}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {children}
    </dialog>
  )
}
