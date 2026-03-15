import { defineConfig } from '@playwright/test'

const baseURL = process.env.BASE_URL || 'http://localhost:8888'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL,
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  // Auto-start static file server for CI (port 4173)
  ...(baseURL.includes(':4173') && {
    webServer: {
      command: `yarn serve dist -l 4173`,
      url: baseURL,
      reuseExistingServer: true,
      timeout: 60_000,
    },
  }),
})
