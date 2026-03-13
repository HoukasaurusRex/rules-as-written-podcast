import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@astrojs/netlify'
import keystatic from '@keystatic/astro'

export default defineConfig({
  site: 'https://rulesaswrittenshow.com',
  output: 'server',
  adapter: netlify(),
  integrations: [react(), keystatic()],
  vite: {
    plugins: [tailwindcss()],
  },
})
