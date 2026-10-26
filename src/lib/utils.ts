export type Bezier = [number, number, number, number]

/** Curva principal: entrada rápida, chegada longa e suave. */
export const EASE_CINE: Bezier = [0.16, 1, 0.3, 1]
/** Curva simétrica para movimentos de ida e volta. */
export const EASE_SHARP: Bezier = [0.65, 0, 0.35, 1]

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
