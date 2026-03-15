import { test, expect } from '@playwright/test'
import { DESKTOP, MOBILE } from '../fixtures'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders episode title and number', async ({ page }) => {
    const h1 = page.locator('h1')
    await expect(h1.first()).toBeVisible()
    const epNumber = page.locator('header h5')
    await expect(epNumber.first()).toHaveText(/EP\d+/)
  })

  test('has navigation sidebar with episode list on desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    const nav = page.getByRole('navigation', { name: /episodes/i })
    await expect(nav).toBeVisible()
    const episodes = nav.locator('ul#menu li')
    const count = await episodes.count()
    expect(count).toBeGreaterThan(0)
  })

  test('episodes are sorted descending by number', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    const nav = page.getByRole('navigation', { name: /episodes/i })
    const links = nav.locator('ul#menu li a')
    const count = await links.count()
    if (count < 2) return

    const hrefs: string[] = []
    for (let i = 0; i < Math.min(count, 5); i++) {
      const href = await links.nth(i).getAttribute('href')
      if (href) hrefs.push(href)
    }
    const numbers = hrefs
      .map(h => {
        const match = h.match(/\/show\/(\d+)\//)
        return match ? parseInt(match[1], 10) : 0
      })
      .filter(n => n > 0)

    for (let i = 1; i < numbers.length; i++) {
      expect(numbers[i]).toBeLessThan(numbers[i - 1])
    }
  })
})

test.describe('Player bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('is visible in the viewport', async ({ page }) => {
    const player = page.locator('.player-bar')
    await expect(player).toBeVisible()
    await expect(player).toBeInViewport()
  })

  test('has play button', async ({ page }) => {
    const playButton = page.getByRole('button', { name: /play/i })
    await expect(playButton).toBeVisible()
  })

  test('has progress bar', async ({ page }) => {
    const progressBar = page.getByRole('slider', { name: /playback/i })
    await expect(progressBar).toBeVisible()
  })

  test('displays current time and duration', async ({ page }) => {
    const currentTime = page.getByLabel(/current time/i)
    await expect(currentTime).toBeVisible({ timeout: 10_000 })
    const duration = page.getByLabel(/duration/i)
    await expect(duration).toBeVisible()
  })
})

test.describe('Episode page', () => {
  test('renders header and article', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: /episodes/i })
    const firstEpisodeLink = nav.locator('ul#menu li a').first()
    const href = await firstEpisodeLink.getAttribute('href')
    expect(href).toBeTruthy()
    await page.goto(href!)

    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('article')).toBeVisible()
  })

  test('URL matches /show/{number}/{slug} pattern', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: /episodes/i })
    const firstEpisodeLink = nav.locator('ul#menu li a').first()
    const href = await firstEpisodeLink.getAttribute('href')
    expect(href).toMatch(/^\/show\/\d+\/[\w-]+\/?$/)
  })
})

test.describe('Newsletter form', () => {
  test('has email input and subscribe button', async ({ page }) => {
    await page.goto('/')
    const emailInput = page.getByRole('textbox', { name: /email/i })
    await expect(emailInput).toBeAttached()
    const submitButton = page.getByRole('button', { name: /subscribe/i })
    await expect(submitButton).toBeAttached()
  })
})

test.describe('SEO', () => {
  test('title follows expected pattern', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title).toContain('Rules as Written')
  })

  test('has og: meta tags', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('meta[property="og:title"]')).toBeAttached()
    await expect(page.locator('meta[property="og:description"]')).toBeAttached()
    await expect(page.locator('meta[property="og:type"]')).toBeAttached()
  })

  test('has twitter meta tags', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('meta[name="twitter:card"]').first()).toBeAttached()
    await expect(page.locator('meta[name="twitter:title"]')).toBeAttached()
  })
})

test.describe('Site navigation', () => {
  test('top navigation bar has links', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation').first()
    const links = nav.getByRole('link')
    const count = await links.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })
})

test.describe('Mobile responsive', () => {
  test('navigation sidebar is hidden on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: /episodes/i })
    await expect(nav).toBeHidden()
  })
})
