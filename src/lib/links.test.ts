import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { SHOT_WIDTHS, projects } from '../config/projects'
import { buildWhatsAppUrl, displayHost, normalizePhone } from './links'

describe('normalizePhone', () => {
  it('retorna null para valores vazios', () => {
    expect(normalizePhone(undefined)).toBeNull()
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone('   ')).toBeNull()
  })

  it('mantém só os dígitos e aceita DDI', () => {
    expect(normalizePhone('+55 (16) 99999-0000')).toBe('5516999990000')
  })

  it('adiciona o DDI 55 a números brasileiros sem DDI', () => {
    expect(normalizePhone('(16) 99999-0000')).toBe('5516999990000')
    expect(normalizePhone('16 3333-0000')).toBe('551633330000')
  })

  it('rejeita números curtos ou longos demais', () => {
    expect(normalizePhone('12345')).toBeNull()
    expect(normalizePhone('1234567890123456')).toBeNull()
  })
})

describe('buildWhatsAppUrl', () => {
  it('retorna null sem número configurado', () => {
    expect(buildWhatsAppUrl('', 'Olá')).toBeNull()
  })

  it('codifica a mensagem', () => {
    const url = buildWhatsAppUrl('5516999990000', 'Olá, Vitor!')
    expect(url).toBe('https://wa.me/5516999990000?text=Ol%C3%A1%2C+Vitor%21')
  })

  it('omite a mensagem vazia', () => {
    expect(buildWhatsAppUrl('5516999990000', '  ')).toBe('https://wa.me/5516999990000')
  })
})

describe('displayHost', () => {
  it('mostra só o domínio', () => {
    expect(displayHost('https://www.nyvora.tech/')).toBe('nyvora.tech')
  })
})

describe('projects', () => {
  it('tem slugs únicos', () => {
    const slugs = projects.map((project) => project.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('usa apenas URLs https', () => {
    for (const project of projects) {
      if (project.url) expect(new URL(project.url).protocol).toBe('https:')
    }
  })

  it('aponta para imagens que existem em public/projects', () => {
    const publicDir = fileURLToPath(new URL('../../public/projects', import.meta.url))
    for (const project of projects) {
      for (const shot of Object.values(project.shots)) {
        if (!shot) continue
        expect(shot.alt.length).toBeGreaterThan(10)
        for (const width of SHOT_WIDTHS[shot.kind]) {
          const file = path.join(publicDir, `${shot.src}-${width}.webp`)
          expect(existsSync(file), file).toBe(true)
        }
      }
    }
  })
})
