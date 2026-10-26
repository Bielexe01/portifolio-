/**
 * Teste de fumaça do build de produção, com Edge/Chrome headless (CDP).
 *
 *   npm run build && npm run smoke
 *
 * Sobe `vite preview`, percorre o site em desktop e celular, confere erros de
 * console, requisições com falha, links externos, âncoras, rolagem
 * horizontal, o botão "Explorar projetos", o diálogo de detalhes, o menu
 * mobile e o modo de movimento reduzido. Salva capturas em scripts/.smoke.
 * Com --og, também gera public/og-image.jpg a partir da abertura.
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'scripts', '.smoke')
const PORT = Number(process.env.SMOKE_PORT ?? 4319)
const BASE = `http://127.0.0.1:${PORT}/`
const WITH_OG = process.argv.includes('--og')
const SHOTS = !process.argv.includes('--no-shots')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function findBrowser() {
  const candidates = [
    process.env.BROWSER_PATH,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean)
  const found = candidates.find((candidate) => existsSync(candidate))
  if (!found) throw new Error('Nenhum Edge/Chrome encontrado. Defina BROWSER_PATH.')
  return found
}

function startPreview() {
  const child = spawn(process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('vite preview não subiu.')), 20000)
    let buffer = ''
    const onData = (chunk) => {
      buffer += String(chunk)
      if (/in use|EADDRINUSE/i.test(buffer)) {
        clearTimeout(timer)
        reject(new Error(`Porta ${PORT} ocupada. Defina SMOKE_PORT com outra porta.`))
        return
      }
      // Só aceita quando o próprio vite anuncia a URL local desta porta.
      if (new RegExp(`Local:\\s+http://127\\.0\\.0\\.1:${PORT}/`).test(buffer.replace(/\u001b\[[0-9;]*m/g, ''))) {
        clearTimeout(timer)
        resolve(child)
      }
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.once('exit', (code) => reject(new Error(`vite preview saiu (${code}).`)))
  })
}

async function launchBrowser(profileDir) {
  const browser = spawn(
    findBrowser(),
    ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profileDir}`, '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars', '--mute-audio', 'about:blank'],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  )
  const wsUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Navegador não respondeu.')), 30000)
    let buffer = ''
    browser.stderr.on('data', (chunk) => {
      buffer += String(chunk)
      const match = buffer.match(/DevTools listening on (ws:\/\/\S+)/)
      if (match) {
        clearTimeout(timer)
        resolve(match[1])
      }
    })
  })
  return { browser, wsUrl }
}

function connect(wsUrl) {
  const socket = new WebSocket(wsUrl)
  let nextId = 1
  const pending = new Map()
  const listeners = new Set()
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data))
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) reject(new Error(message.error.message))
      else resolve(message.result)
      return
    }
    for (const listener of listeners) listener(message)
  })
  const ready = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = nextId++
      pending.set(id, { resolve, reject })
      socket.send(JSON.stringify({ id, method, params, sessionId }))
    })
  return { ready, send, listeners, close: () => socket.close() }
}

async function openPage(cdp, viewport, { reducedMotion = false } = {}) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true })
  const send = (method, params) => cdp.send(method, params, sessionId)
  const issues = []

  const listener = (message) => {
    if (message.sessionId !== sessionId) return
    const { method, params } = message
    if (method === 'Runtime.consoleAPICalled' && (params.type === 'error' || params.type === 'warning')) {
      issues.push(`console.${params.type}: ${params.args.map((arg) => arg.value ?? arg.description ?? '').join(' ')}`)
    }
    if (method === 'Runtime.exceptionThrown') {
      issues.push(`exception: ${params.exceptionDetails.exception?.description ?? params.exceptionDetails.text}`)
    }
    if (method === 'Log.entryAdded' && params.entry.level === 'error') {
      issues.push(`log: ${params.entry.text} ${params.entry.url ?? ''}`)
    }
    if (method === 'Network.responseReceived' && params.response.status >= 400) {
      issues.push(`http ${params.response.status}: ${params.response.url}`)
    }
    if (method === 'Network.loadingFailed' && !params.canceled) {
      issues.push(`falha de rede: ${params.errorText}`)
    }
  }
  cdp.listeners.add(listener)

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Log.enable')
  await send('Network.enable')
  await send('Emulation.setDeviceMetricsOverride', viewport)
  if (viewport.mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
  if (reducedMotion) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })

  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(`evaluate falhou: ${result.exceptionDetails.exception?.description ?? expression}`)
    return result.result.value
  }

  const shot = async (name) => {
    if (!SHOTS) return
    const { data } = await send('Page.captureScreenshot', { format: 'png' })
    await writeFile(path.join(outDir, `${name}.png`), Buffer.from(data, 'base64'))
  }

  const scrollTo = async (selector, offset = 0) => {
    await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw new Error('não achei ${selector}'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + ${offset}, behavior: 'instant' }) })()`)
    await sleep(1400)
  }

  const key = async (keyName, code, keyCode) => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: keyCode })
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: keyCode })
  }

  const loaded = new Promise((resolve) => {
    const onLoad = (message) => {
      if (message.sessionId === sessionId && message.method === 'Page.loadEventFired') {
        cdp.listeners.delete(onLoad)
        resolve()
      }
    }
    cdp.listeners.add(onLoad)
  })
  await send('Page.navigate', { url: BASE })
  await loaded
  await evaluate('document.fonts.ready.then(() => true)')
  await sleep(1800)

  const close = async () => {
    cdp.listeners.delete(listener)
    await cdp.send('Target.closeTarget', { targetId })
  }

  return { send, evaluate, shot, scrollTo, key, issues, close }
}

const STATIC_CHECKS = `(() => {
  const external = [...document.querySelectorAll('a[target="_blank"]')].map((a) => ({ href: a.href, rel: a.rel }))
  const badRel = external.filter((link) => !link.rel.includes('noopener'))
  const brokenAnchors = [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((href) => href.length > 1 && !document.getElementById(href.slice(1)))
  const emptyButtons = [...document.querySelectorAll('button')].filter((b) => !b.textContent.trim() && !b.getAttribute('aria-label')).length
  const imgsNoAlt = [...document.querySelectorAll('img')].filter((img) => !img.hasAttribute('alt')).length
  const h1 = document.querySelectorAll('h1').length
  const overflowX = document.documentElement.scrollWidth - window.innerWidth
  return { externalHrefs: [...new Set(external.map((l) => l.href))], badRel, brokenAnchors, emptyButtons, imgsNoAlt, h1, overflowX }
})()`

async function runDesktop(cdp, report) {
  const page = await openPage(cdp, { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
  await page.shot('d-01-hero')
  report.desktop = { static: await page.evaluate(STATIC_CHECKS) }

  // "Explorar projetos" rola até a seção de projetos.
  await page.evaluate(`[...document.querySelectorAll('a[href="#projetos"]')].find((a) => /explorar projetos/i.test(a.textContent)).click()`)
  await sleep(2200)
  report.desktop.exploreTop = await page.evaluate(`Math.round(document.getElementById('projetos').getBoundingClientRect().top)`)

  const stops = [
    ['#perfil', 'd-02-perfil', 0],
    ['#projetos', 'd-03-projetos', 0],
    ['#projeto-drop-coffee', 'd-04-drop', 0],
    ['#projeto-drop-coffee figure', 'd-05-drop-band', -120],
    ['#projeto-nyvora', 'd-06-nyvora', 80],
    ['#projeto-motors', 'd-07-motors', 60],
    ['#projeto-motors', 'd-08-motors-b', 760],
    ['#projeto-jane', 'd-09-jane', 80],
    ['#projeto-sistemas', 'd-10-sistemas', 80],
    ['#processo', 'd-11-processo', 120],
    ['#stack', 'd-12-stack', 240],
    ['#contato', 'd-13-contato', 0],
  ]
  for (const [selector, name, offset] of stops) {
    await page.scrollTo(selector, offset)
    await page.shot(name)
  }
  await page.evaluate(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })`)
  await sleep(1200)
  await page.shot('d-14-footer')

  // Diálogo de detalhes.
  await page.scrollTo('#projeto-motors', 60)
  await page.evaluate(`document.querySelector('#projeto-motors button[aria-haspopup="dialog"]').click()`)
  await sleep(900)
  const dialog = await page.evaluate(`(() => { const d = document.querySelector('dialog[open]'); return d ? { title: d.querySelector('h2')?.textContent, focused: document.activeElement?.textContent?.trim() } : null })()`)
  await page.shot('d-15-dialog')
  await page.key('Escape', 'Escape', 27)
  await sleep(700)
  const dialogClosed = await page.evaluate(`!document.querySelector('dialog[open]')`)
  report.desktop.dialog = { ...dialog, closedWithEsc: dialogClosed }

  // Etapas do processo e IDE.
  await page.scrollTo('#processo', 120)
  await page.evaluate(`document.querySelectorAll('#processo [role="tab"]')[3].click()`)
  await sleep(900)
  report.desktop.mindset = await page.evaluate(`document.getElementById('etapa-painel').textContent.includes('Construir a interface.')`)
  await page.shot('d-16-processo-04')

  await page.scrollTo('#stack', 240)
  await page.evaluate(`document.querySelectorAll('#stack [role="tab"]')[2].click()`)
  await sleep(300)
  await page.evaluate(`[...document.querySelectorAll('#stack-editor button')][1].focus()`)
  await sleep(400)
  report.desktop.stack = await page.evaluate(`document.querySelector('#stack aside').textContent`)
  await page.shot('d-17-stack-db')

  report.desktop.issues = page.issues
  await page.close()
}

async function runMobile(cdp, report) {
  const page = await openPage(cdp, { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await page.shot('m-01-hero')
  report.mobile = { static: await page.evaluate(STATIC_CHECKS) }

  const stops = [
    ['#perfil', 'm-02-perfil', 0],
    ['#projetos', 'm-03-projetos', 0],
    ['#projeto-drop-coffee', 'm-04-drop', 0],
    ['#projeto-nyvora', 'm-05-nyvora', 0],
    ['#projeto-jane', 'm-06-jane', 0],
    ['#projeto-sistemas', 'm-07-sistemas', 300],
    ['#processo', 'm-08-processo', 300],
    ['#stack', 'm-09-stack', 300],
    ['#contato', 'm-10-contato', 200],
  ]
  for (const [selector, name, offset] of stops) {
    await page.scrollTo(selector, offset)
    await page.shot(name)
  }

  // Menu mobile: abre, navega e fecha.
  await page.evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`)
  await sleep(600)
  await page.evaluate(`[...document.querySelectorAll('header button')].find((b) => /menu/i.test(b.textContent)).click()`)
  await sleep(900)
  report.mobile.menuOpen = await page.evaluate(`Boolean(document.querySelector('dialog.menu-sheet[open]'))`)
  await page.shot('m-11-menu')
  await page.evaluate(`[...document.querySelectorAll('dialog.menu-sheet a')].find((a) => a.getAttribute('href') === '#stack').click()`)
  await sleep(2400)
  report.mobile.menuNavigate = await page.evaluate(`({ closed: !document.querySelector('dialog.menu-sheet[open]'), top: Math.round(document.getElementById('stack').getBoundingClientRect().top), locked: document.documentElement.classList.contains('modal-open') })`)

  report.mobile.issues = page.issues
  await page.close()
}

async function runReduced(cdp, report) {
  const page = await openPage(cdp, { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, { reducedMotion: true })
  await page.shot('r-01-hero')
  await page.scrollTo('#projeto-nyvora', 80)
  await page.shot('r-02-nyvora')
  report.reduced = {
    cursor: await page.evaluate(`document.documentElement.classList.contains('has-cursor')`),
    scrollBehavior: await page.evaluate(`getComputedStyle(document.documentElement).scrollBehavior`),
    issues: page.issues,
  }
  await page.close()
}

async function runOg(cdp) {
  const page = await openPage(cdp, { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false })
  await sleep(1200)
  const { data } = await page.send('Page.captureScreenshot', { format: 'jpeg', quality: 86 })
  await writeFile(path.join(root, 'public', 'og-image.jpg'), Buffer.from(data, 'base64'))
  await page.close()
}

async function main() {
  if (!existsSync(path.join(root, 'dist', 'index.html'))) throw new Error('Rode `npm run build` antes.')
  await mkdir(outDir, { recursive: true })
  const preview = await startPreview()
  const profileDir = await mkdtemp(path.join(os.tmpdir(), 'portfolio-smoke-'))
  const { browser, wsUrl } = await launchBrowser(profileDir)
  const cdp = connect(wsUrl)
  const report = {}
  try {
    await cdp.ready
    if (WITH_OG) {
      await runOg(cdp)
      console.log('✓ public/og-image.jpg')
    } else {
      await runDesktop(cdp, report)
      await runMobile(cdp, report)
      await runReduced(cdp, report)
      await writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
      console.log(JSON.stringify(report, null, 2))
    }
  } finally {
    cdp.close()
    browser.kill()
    preview.kill()
    await sleep(800)
    await rm(profileDir, { recursive: true, force: true }).catch(() => {})
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
