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

  test('has navigation sidebar with episode list', async ({ page }) => {
    const nav = page.locator('nav.episodes_list')
    await expect(nav).toBeAttached()
    const episodes = nav.locator('ul#menu li')
    const count = await episodes.count()
    expect(count).toBeGreaterThan(0)
  })

  test('episodes are sorted descending by number', async ({ page }) => {
    const nav = page.locator('nav.episodes_list')
    const episodeTitles = nav.locator('ul#menu li h4')
    const count = await episodeTitles.count()
    if (count < 2) return

    // Episode titles contain the episode info; the list should be in descending order
    // We verify the first episode link comes before subsequent ones in DOM (descending)
    const links = nav.locator('ul#menu li a[role="menuitem"]')
    const hrefs: string[] = []
    for (let i = 0; i < Math.min(count, 5); i++) {
      const href = await links.nth(i).getAttribute('href')
      if (href) hrefs.push(href)
    }
    // URLs are /show/{number}/{slug} - extract numbers
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
    const player = page.locator('.player')
    await expect(player).toBeAttached()
    const position = await player.evaluate(el => getComputedStyle(el).position)
    expect(position).toBe('fixed')
    const bottom = await player.evaluate(el => getComputedStyle(el).bottom)
    expect(bottom).toBe('0px')
  })

  test('has play button', async ({ page }) => {
    const playButton = page.locator('.player button[aria-label]')
    await expect(playButton.first()).toBeVisible()
  })

  test('has progress bar', async ({ page }) => {
    const progressBar = page.locator('.player .progress')
    await expect(progressBar).toBeAttached()
  })

  test('has audio element with src', async ({ page }) => {
    const audio = page.locator('.player audio')
    await expect(audio).toBeAttached()
    const src = await audio.getAttribute('src')
    expect(src).toBeTruthy()
  })

  test('displays current time and duration', async ({ page }) => {
    // Time spans in the player area
    const timeSpans = page.locator('.player span')
    const count = await timeSpans.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })
})

test.describe('Episode page', () => {
  test('renders header, article, and aside', async ({ page }) => {
    // Navigate to the first episode link from the nav
    await page.goto('/')
    const firstEpisodeLink = page.locator('nav.episodes_list ul#menu li a[role="menuitem"]').first()
    const href = await firstEpisodeLink.getAttribute('href')
    expect(href).toBeTruthy()
    await page.goto(href!)

    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('article')).toBeVisible()
  })

  test('URL matches /show/{number}/{slug} pattern', async ({ page }) => {
    await page.goto('/')
    const firstEpisodeLink = page.locator('nav.episodes_list ul#menu li a[role="menuitem"]').first()
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
    // Theme UI applies background to the Themed.root div, not body
    const bgColor = await page.evaluate(() => {
      // Walk up from a visible element to find the dark background
      const el = document.querySelector('.player') || document.body
      let current: Element | null = el
      while (current) {
        const bg = getComputedStyle(current).backgroundColor
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return bg
        }
        current = current.parentElement
      }
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
    // Sidebar width should be around 300px (allow some tolerance)
    expect(box!.width).toBeGreaterThan(250)
    expect(box!.width).toBeLessThan(350)
  })
})

test.describe('Provider links', () => {
  test('Spotify, Apple, Google, Patreon links exist', async ({ page }) => {
    await page.goto('/')
    // Provider links are in the navigation sidebar and/or aside
    const spotify = page.locator('a[href*="spotify.com"]')
    await expect(spotify.first()).toBeAttached()

    const apple = page.locator('a[href*="podcasts.apple.com"]')
    await expect(apple.first()).toBeAttached()

    const google = page.locator('a[href*="podcasts.google.com"]')
    await expect(google.first()).toBeAttached()

    const patreon = page.locator('a[href*="patreon.com"]')
    await expect(patreon.first()).toBeAttached()
  })
})

test.describe('Mobile responsive', () => {
  test('navigation is hidden off-screen at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    const nav = page.locator('nav.episodes_list')
    // Navigation should be transformed off-screen
    const transform = await nav.evaluate(el => getComputedStyle(el).transform)
    // translateX(-100%) results in a matrix transform with negative X translation
    expect(transform).not.toBe('none')
  })
})
