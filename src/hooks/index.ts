import { useEffect, useState, useSyncExternalStore } from 'react'

/** Acompanha uma media query (ex.: '(min-width: 1024px)'). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Mouse ou trackpad (não toque). */
export function useFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)')
}

/** Seção que cruza o meio da tela. */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [ids])

  return active
}

const timeFormatter = (timeZone: string) =>
  new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone })

/** Hora local de um fuso, atualizada a cada minuto. */
export function useLocalTime(timeZone: string): { hours: string; minutes: string } {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let interval: number | undefined
    const toNextMinute = 60_000 - (Date.now() % 60_000)
    const timeout = window.setTimeout(() => {
      setNow(new Date())
      interval = window.setInterval(() => setNow(new Date()), 60_000)
    }, toNextMinute + 50)
    return () => {
      window.clearTimeout(timeout)
      if (interval) window.clearInterval(interval)
    }
  }, [])

  const parts = timeFormatter(timeZone).formatToParts(now)
  const hours = parts.find((part) => part.type === 'hour')?.value ?? '00'
  const minutes = parts.find((part) => part.type === 'minute')?.value ?? '00'
  return { hours, minutes }
}

/** Rola até uma seção respeitando a preferência de movimento reduzido. */
export function scrollToSection(id: string): void {
  const element = document.getElementById(id)
  if (!element) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  element.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', `#${id}`)
}
