import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { HtmlTagDescriptor, Plugin } from 'vite'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * Injeta canonical, og:url e og:image absolutos quando VITE_SITE_URL existe.
 * Sem a variável, usa caminhos relativos (o site continua funcionando).
 */
function siteMeta(rawSiteUrl: string | undefined): Plugin {
  const siteUrl = (rawSiteUrl ?? '').trim().replace(/\/+$/, '')
  const image = `${siteUrl}/og-image.jpg`

  return {
    name: 'portfolio-site-meta',
    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = [
        { tag: 'meta', attrs: { property: 'og:image', content: image }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:image', content: image }, injectTo: 'head' },
      ]
      if (siteUrl) {
        tags.push(
          { tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}/` }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:url', content: `${siteUrl}/` }, injectTo: 'head' },
        )
      }
      return tags
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react(), tailwindcss(), siteMeta(env.VITE_SITE_URL)],
    server: { host: '127.0.0.1', port: 5173 },
    preview: { host: '127.0.0.1', port: 4173 },
    build: { target: 'es2022', sourcemap: false },
    test: { environment: 'node', include: ['src/**/*.test.ts'] },
  }
})
