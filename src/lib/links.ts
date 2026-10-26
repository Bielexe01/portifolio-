/**
 * Normaliza um telefone para o formato do wa.me (só dígitos, com DDI).
 * Números brasileiros com 10 ou 11 dígitos (DDD + número) recebem o DDI 55.
 * Retorna null quando o valor está vazio ou não parece um telefone válido.
 */
export function normalizePhone(raw: string | undefined | null): string | null {
  if (!raw) return null
  let digits = raw.replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`
  if (digits.length < 12 || digits.length > 15) return null
  return digits
}

/** Monta o link do WhatsApp, ou null quando o número não foi configurado. */
export function buildWhatsAppUrl(raw: string | undefined | null, message?: string): string | null {
  const phone = normalizePhone(raw)
  if (!phone) return null
  const url = new URL(`https://wa.me/${phone}`)
  const text = message?.trim()
  if (text) url.searchParams.set('text', text)
  return url.toString()
}

/** Domínio legível de uma URL, sem "www." (ex.: "nyvora.tech"). */
export function displayHost(url: string): string {
  return new URL(url).host.replace(/^www\./, '')
}
