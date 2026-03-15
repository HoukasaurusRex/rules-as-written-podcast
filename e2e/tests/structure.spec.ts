import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders episode title and number', async ({ page }) => {
    const h1 = page.locator('h1')
    await expect(h1.first()).toBeVisible()
    // Episode number is shown as "EP{number}" in header h5
    const epNumber = page.locator('header h5')
    await expect(epNumber.first()).toHaveText(/EP\d+/)
  })

  test('has navigation sidebar with episode list on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    const nav = page.locator('nav.episodes_list')
    await expect(nav).toBeAttached()
    const episodes = nav.locator('ul#menu li')
    const count = await episodes.count()
    expect(count).toBeGreaterThan(0)
  })

  test('episodes are sorted descending by number', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    const nav = page.locator('nav.episodes_list')
    const episodeTitles = nav.locator('ul#menu li h4')
    const count = await episodeTitles.count()
    if (count < 2) return

    const links = nav.locator('ul#menu li a')
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

  test('is fixed at the bottom of the page', async ({ page }) => {
    const player = page.locator('.player-bar')
    await expect(player).toBeAttached()
    const position = await player.evaluate(el => getComputedStyle(el).position)
    expect(position).toBe('fixed')
    const bottom = await player.evaluate(el => getComputedStyle(el).bottom)
    expect(bottom).toBe('0px')
  })

  test('has play button', async ({ page }) => {
    const playButton = page.locator('.player-bar .player-play-btn')
    await expect(playButton).toBeVisible()
  })

  test('has progress bar', async ({ page }) => {
    const progressBar = page.locator('.player-bar .player-progress-bar')
    await expect(progressBar).toBeAttached()
  })

  test('displays current time and duration', async ({ page }) => {
    const timeSpan = page.locator('.player-bar .player-time').first()
    await expect(timeSpan).toBeVisible({ timeout: 10_000 })
    const count = await page.locator('.player-bar .player-time').count()
    expect(count).toBeGreaterThanOrEqual(2)
  })
})

test.describe('Episode page', () => {
  test('renders header and article', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    const firstEpisodeLink = page.locator('nav.episodes_list ul#menu li a').first()
    const href = await firstEpisodeLink.getAttribute('href')
    expect(href).toBeTruthy()
    await page.goto(href!)

    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('article')).toBeVisible()
  })

  test('URL matches /show/{number}/{slug} pattern', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    const firstEpisodeLink = page.locator('nav.episodes_list ul#menu li a').first()
    const href = await firstEpisodeLink.getAttribute('href')
    expect(href).toMatch(/^\/show\/\d+\/[\w-]+\/?$/)
  })
})

test.describe('Newsletter form', () => {
  test('has email input and subscribe button', async ({ page }) => {
    await page.goto('/')
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeAttached()
    const submitButton = page.locator('button[type="submit"]')
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
    const ogTitle = page.locator('meta[property="og:title"]')
    await expect(ogTitle).toBeAttached()
    const ogDescription = page.locator('meta[property="og:description"]')
    await expect(ogDescription).toBeAttached()
    const ogType = page.locator('meta[property="og:type"]')
    await expect(ogType).toBeAttached()
  })

  test('has twitter meta tags', async ({ page }) => {
    await page.goto('/')
    const twitterCard = page.locator('meta[name="twitter:card"]')
    await expect(twitterCard.first()).toBeAttached()
    const twitterTitle = page.locator('meta[name="twitter:title"]')
    await expect(twitterTitle).toBeAttached()
  })
})

test.describe('Layout and theme', () => {
  test('has dark background color', async ({ page }) => {
    await page.goto('/')
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor
    })
    // #1A2232 = rgb(26, 34, 50)
    expect(bgColor).toBe('rgb(26, 34, 50)')
  })

  test('navigation sidebar is ~300px on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    const nav = page.locator('nav.episodes_list')
    const box = await nav.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.width).toBeGreaterThan(250)
    expect(box!.width).toBeLessThan(350)
  })
})

test.describe('Site navigation', () => {
  test('top navigation bar has links', async ({ page }) => {
    await page.goto('/')
    const navLinks = page.locator('.site-nav-links a')
    const count = await navLinks.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })
})

test.describe('Mobile responsive', () => {
  test('navigation sidebar is hidden on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    const nav = page.locator('nav.episodes_list')
    // Sidebar is display: none on mobile
    const display = await nav.evaluate(el => getComputedStyle(el).display)
    expect(display).toBe('none')
  })
})
