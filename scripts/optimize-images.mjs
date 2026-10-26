/**
 * Converte as capturas (scripts/.captures/*.png) em WebP responsivo
 * dentro de public/projects. Rode depois de `npm run capture`.
 *
 * Para um projeto novo: adicione { from, to, kind } em JOBS e use o
 * mesmo `to` no campo `media` do projeto em src/config/projects.ts.
 */
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const WIDTHS = { desktop: [960, 1600], mobile: [390, 780] }

const JOBS = [
  { from: 'drop-coffee-desktop-2_2', to: 'drop-coffee-cinema', kind: 'desktop' },
  { from: 'drop-coffee-desktop-0', to: 'drop-coffee-hero', kind: 'desktop' },
  { from: 'drop-coffee-mobile-0', to: 'drop-coffee-mobile', kind: 'mobile' },
  { from: 'nyvora-desktop-0', to: 'nyvora-hero', kind: 'desktop' },
  { from: 'nyvora-desktop-3', to: 'nyvora-clouds', kind: 'desktop' },
  { from: 'nyvora-mobile-0', to: 'nyvora-mobile', kind: 'mobile' },
  { from: 'motors-desktop-0', to: 'motors-hero', kind: 'desktop' },
  { from: 'motors-desktop-2', to: 'motors-vitrine', kind: 'desktop' },
  { from: 'motors-mobile-0', to: 'motors-mobile', kind: 'mobile' },
  { from: 'jane-desktop-0', to: 'jane-hero', kind: 'desktop' },
  { from: 'jane-desktop-1', to: 'jane-loja', kind: 'desktop' },
  { from: 'jane-mobile-0', to: 'jane-mobile', kind: 'mobile' },
]

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const inDir = path.join(root, 'scripts', '.captures')
const outDir = path.join(root, 'public', 'projects')

sharp.concurrency(1)
sharp.cache(false)

await mkdir(outDir, { recursive: true })

for (const job of JOBS) {
  const source = path.join(inDir, `${job.from}.png`)
  if (!existsSync(source)) {
    console.warn(`  ! ${job.from}.png não encontrado, pulando`)
    continue
  }
  for (const width of WIDTHS[job.kind]) {
    const target = path.join(outDir, `${job.to}-${width}.webp`)
    const info = await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 76, effort: 5, smartSubsample: true })
      .toFile(target)
    console.log(`  ✓ ${path.basename(target)}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`)
  }
}
