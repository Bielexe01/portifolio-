import { buildWhatsAppUrl } from '../lib/links'

export const profile = {
  fullName: 'Vitor Gabriel Ferreira Ribeiro',
  shortName: 'Vitor Gabriel',
  initials: 'VG',
  role: 'Desenvolvedor Full Stack em formação',
  education: 'Análise e Desenvolvimento de Sistemas',
  location: 'Guariba / Ribeirão Preto, SP',
  timeZone: 'America/Sao_Paulo',
  availability: 'AVAILABLE FOR PROJECTS',
  concept: "I BUILD WHAT DOESN'T EXIST YET.",
  heroStack: ['React', 'Node.js', 'PHP', 'PostgreSQL'],
} as const

const DEFAULT_WHATSAPP_MESSAGE = 'Olá, Vitor! Vi seu portfólio e quero conversar sobre um projeto.'

export const contactLinks = {
  github: 'https://github.com/Bielexe01',
  githubHandle: 'github.com/Bielexe01',
  linkedin: 'https://www.linkedin.com/in/vitor-gabriel-ferreira-ribeiro-333b73221/',
  linkedinHandle: 'in/vitor-gabriel-ferreira-ribeiro',
  /** null enquanto VITE_WHATSAPP_NUMBER não estiver configurado no .env */
  whatsapp: buildWhatsAppUrl(
    import.meta.env.VITE_WHATSAPP_NUMBER,
    import.meta.env.VITE_WHATSAPP_MESSAGE || DEFAULT_WHATSAPP_MESSAGE,
  ),
} as const
