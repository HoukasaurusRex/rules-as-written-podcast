import { defineConfig } from '@playwright/test'

const baseURL = process.env.BASE_URL || 'https://rulesaswrittenshow.com'
const isLocalServer = baseURL.includes('localhost')

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
  ...(isLocalServer && {
    webServer: {
      command: `yarn serve dist -l ${new URL(baseURL).port}`,
      url: baseURL,
      reuseExistingServer: true,
    },
  }),
})
