/**
 * Captura screenshots reais dos projetos publicados, usando Edge/Chrome em
 * modo headless via Chrome DevTools Protocol (sem dependências extras).
 *
 *   npm run capture             -> captura todos os alvos
 *   npm run capture -- motors   -> captura só os alvos cujo slug contém "motors"
 *
 * Depois rode `npm run images` para gerar os WebP em public/projects.
 * Para um projeto novo, adicione uma linha em TARGETS.
 * Navegador diferente: defina BROWSER_PATH com o caminho do executável.
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const TARGETS = [
  { slug: 'drop-coffee', url: 'https://coffenyv.vercel.app/', scrolls: [0, 1, 2.2] },
  { slug: 'nyvora', url: 'https://nyvora.tech/', scrolls: [0, 1.2, 3] },
  { slug: 'motors', url: 'https://motors.nyvora.tech/', scrolls: [0, 1, 2] },
  { slug: 'jane', url: 'https://janemateriais-opal.vercel.app/', scrolls: [0, 1, 2.2] },
]

const DESKTOP = { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false }
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }
const SETTLE_MS = Number(process.env.CAPTURE_SETTLE_MS ?? 5000)

const root = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(root, '.captures')

function findBrowser() {
  const candidates = [
    process.env.BROWSER_PATH,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/microsoft-edge',
  ].filter(Boolean)
  const found = candidates.find((candidate) => existsSync(candidate))
  if (!found) throw new Error('Nenhum Edge/Chrome encontrado. Defina BROWSER_PATH.')
  return found
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function launch(profileDir) {
  const browser = spawn(
    findBrowser(),
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--hide-scrollbars',
      '--mute-audio',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  )

  const wsUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Navegador não respondeu a tempo.')), 30000)
    let buffer = ''
    browser.stderr.on('data', (chunk) => {
      buffer += chunk.toString()
      const match = buffer.match(/DevTools listening on (ws:\/\/\S+)/)
      if (match) {
        clearTimeout(timer)
        resolve(match[1])
      }
    })
    browser.once('exit', (code) => reject(new Error(`Navegador encerrou (código ${code}).`)))
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

  const waitFor = (method, sessionId, timeout = 45000) =>
    new Promise((resolve) => {
      const timer = setTimeout(() => {
        listeners.delete(listener)
        resolve(null)
      }, timeout)
      const listener = (message) => {
        if (message.method === method && message.sessionId === sessionId) {
          clearTimeout(timer)
          listeners.delete(listener)
          resolve(message.params)
        }
      }
      listeners.add(listener)
    })

  return { ready, send, waitFor, close: () => socket.close() }
}

async function capture(cdp, target, viewport, label, scrolls) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true })
  const send = (method, params) => cdp.send(method, params, sessionId)

  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', viewport)
  if (viewport.mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })

  const loaded = cdp.waitFor('Page.loadEventFired', sessionId)
  await send('Page.navigate', { url: target.url })
  await loaded
  await sleep(SETTLE_MS)

  let current = 0
  for (const factor of scrolls) {
    const goal = Math.round(factor * viewport.height)
    while (current < goal) {
      const delta = Math.min(120, goal - current)
      await send('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: Math.round(viewport.width / 2),
        y: Math.round(viewport.height / 2),
        deltaX: 0,
        deltaY: delta,
      })
      current += delta
      await sleep(60)
    }
    await sleep(factor === 0 ? 300 : 2200)
    const { data } = await send('Page.captureScreenshot', { format: 'png' })
    const file = path.join(outDir, `${target.slug}-${label}-${String(factor).replace('.', '_')}.png`)
    await writeFile(file, Buffer.from(data, 'base64'))
    console.log(`  ✓ ${path.basename(file)}`)
  }

  await cdp.send('Target.closeTarget', { targetId })
}

async function main() {
  const filter = process.argv[2]
  const targets = filter ? TARGETS.filter((target) => target.slug.includes(filter)) : TARGETS
  if (targets.length === 0) throw new Error(`Nenhum alvo corresponde a "${filter}".`)

  await mkdir(outDir, { recursive: true })
  const profileDir = await mkdtemp(path.join(os.tmpdir(), 'portfolio-capture-'))
  const { browser, wsUrl } = await launch(profileDir)
  const cdp = connect(wsUrl)

  try {
    await cdp.ready
    for (const target of targets) {
      console.log(`→ ${target.url}`)
      await capture(cdp, target, DESKTOP, 'desktop', target.scrolls)
      await capture(cdp, target, MOBILE, 'mobile', [0])
    }
  } finally {
    cdp.close()
    browser.kill()
    await sleep(800)
    await rm(profileDir, { recursive: true, force: true }).catch(() => {})
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
