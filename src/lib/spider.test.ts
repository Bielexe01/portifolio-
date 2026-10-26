import { describe, expect, it, vi } from 'vitest'
import { spiderPhrases, spiderStations } from '../config/spider'
import {
  NO_LINE,
  aimAngle,
  greetSpiderFans,
  linePath,
  nextPhraseIndex,
  pickStation,
  senseLines,
  stationPoint,
  webPath,
  zipDuration,
  zipPoint,
} from './spider'

describe('spiderStations', () => {
  it('tem nomes únicos e pontos entre 0 e 1', () => {
    const ids = spiderStations.map((station) => station.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const station of spiderStations) {
      expect(station.x).toBeGreaterThanOrEqual(0)
      expect(station.x).toBeLessThanOrEqual(1)
      expect(station.y).toBeGreaterThanOrEqual(0)
      expect(station.y).toBeLessThanOrEqual(1)
    }
  })
})

describe('stationPoint', () => {
  const box = { left: 100, top: 400, width: 600, height: 200 }

  it('acha o ponto dentro da caixa', () => {
    expect(stationPoint(box, { x: 0.5, y: 0 }, 1440, 28)).toEqual({ x: 400, y: 400 })
    expect(stationPoint(box, { x: 1, y: 1 }, 1440, 28)).toEqual({ x: 700, y: 600 })
  })

  it('não deixa o boneco sair da tela', () => {
    expect(stationPoint({ ...box, left: 1300 }, { x: 1, y: 0 }, 1440, 28).x).toBe(1440 - 28 - 8)
    expect(stationPoint({ ...box, left: -50 }, { x: 0, y: 0 }, 1440, 28).x).toBe(28 + 8)
  })
})

describe('pickStation', () => {
  const band = { top: 72, bottom: 700, focus: 380 }

  it('fica na parada atual enquanto ela aparece', () => {
    const list = [
      { index: 0, y: 100 },
      { index: 1, y: 390 },
    ]
    expect(pickStation(list, 0, band)).toBe(0)
  })

  it('troca pela visível mais perto do foco quando a atual some', () => {
    const list = [
      { index: 0, y: -40 },
      { index: 1, y: 650 },
      { index: 2, y: 420 },
    ]
    expect(pickStation(list, 0, band)).toBe(2)
  })

  it('sem nenhuma visível, continua onde está', () => {
    expect(pickStation([{ index: 0, y: -300 }, { index: 1, y: Number.NaN }], 0, band)).toBe(0)
    expect(pickStation([], -1, band)).toBe(-1)
  })

  it('na primeira vez, escolhe a melhor visível', () => {
    expect(pickStation([{ index: 3, y: 200 }], -1, band)).toBe(3)
  })
})

describe('viagem na teia', () => {
  const from = { x: 1300, y: 120 }
  const to = { x: 300, y: 620 }

  it('sai do ponto atual e chega no alvo', () => {
    expect(zipPoint(from, to, 0)).toEqual(from)
    const end = zipPoint(from, to, 1)
    expect(end.x).toBeCloseTo(to.x, 6)
    expect(end.y).toBeCloseTo(to.y, 6)
  })

  it('faz um arco para cima no meio do caminho', () => {
    const middle = zipPoint(from, to, 0.5)
    expect(middle.y).toBeLessThan((from.y + to.y) / 2)
  })

  it('dura mais quando é mais longe, dentro de um limite', () => {
    const near = zipDuration(from, { x: 1280, y: 140 })
    const far = zipDuration(from, to)
    expect(near).toBeGreaterThanOrEqual(0.42)
    expect(far).toBeGreaterThan(near)
    expect(zipDuration({ x: 0, y: 0 }, { x: 0, y: 99_999 })).toBe(0.9)
  })

  it('aponta as mãos para o alvo', () => {
    expect(aimAngle({ x: 0, y: 0 }, { x: 0, y: -10 })).toBeCloseTo(0, 6)
    expect(aimAngle({ x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(90, 6)
    expect(aimAngle({ x: 0, y: 0 }, { x: -10, y: 0 })).toBeCloseTo(-90, 6)
  })

  it('desenha a linha da teia', () => {
    expect(linePath({ x: 1.234, y: 5 }, { x: 10, y: -0.001 })).toBe('M1.23 5L10 0')
    expect(NO_LINE).toBe('M-99 -99')
  })
})

describe('nextPhraseIndex', () => {
  it('começa pela primeira frase', () => {
    expect(nextPhraseIndex(-1, spiderPhrases.length)).toBe(0)
  })

  it('nunca repete a frase atual', () => {
    const total = spiderPhrases.length
    for (const value of [0, 0.25, 0.5, 0.75, 0.999999, 1]) {
      for (let current = 0; current < total; current++) {
        const next = nextPhraseIndex(current, total, () => value)
        expect(next).not.toBe(current)
        expect(next).toBeGreaterThanOrEqual(0)
        expect(next).toBeLessThan(total)
      }
    }
  })

  it('com uma frase só, devolve ela', () => {
    expect(nextPhraseIndex(0, 1)).toBe(0)
  })
})

describe('webPath', () => {
  it('desenha um raio por fio', () => {
    const path = webPath({ radius: 30, spokes: 8, rings: 3 })
    expect(path.match(/M0 0L/g)).toHaveLength(8)
    expect(path.match(/Q/g)).toHaveLength(8 * 3)
  })

  it('a teia de canto vai de 0° a 90° sem fechar', () => {
    const path = webPath({ radius: 60, spokes: 5, rings: 2, from: 0, to: 90 })
    expect(path.startsWith('M0 0L60 0')).toBe(true)
    expect(path).toContain('M0 0L0 60')
    expect(path.match(/Q/g)).toHaveLength(4 * 2)
    expect(path).not.toMatch(/NaN|-0 /)
  })
})

describe('senseLines', () => {
  it('desenha um risco por direção', () => {
    expect(senseLines(8, 27, 37, 40).match(/M/g)).toHaveLength(8)
  })
})

describe('greetSpiderFans', () => {
  it('escreve no console só uma vez', () => {
    const log = vi.fn()
    expect(greetSpiderFans(log)).toBe(true)
    expect(greetSpiderFans(log)).toBe(false)
    expect(log).toHaveBeenCalledTimes(1)
    expect(String(log.mock.calls[0]?.[0])).toContain('Thwip!')
  })
})
