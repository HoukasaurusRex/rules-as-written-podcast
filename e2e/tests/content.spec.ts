import { test, expect } from '@playwright/test'

test.describe('Episode content', () => {
  test('episode titles are rendered in navigation', async ({ page }) => {
    await page.goto('/')
    const episodeTitles = page.locator('nav.episodes_list ul#menu li h4')
    const count = await episodeTitles.count()
    expect(count).toBeGreaterThan(0)

    // Each title should have non-empty text
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await episodeTitles.nth(i).textContent()
      expect(text?.trim().length).toBeGreaterThan(0)
    }
  })

  test('episode page renders markdown content when available', async ({ page }) => {
    await page.goto('/')
    // Navigate to an episode that should have markdown content
    const episodeLinks = page.locator('nav.episodes_list ul#menu li a[role="menuitem"]')
    const count = await episodeLinks.count()
    if (count === 0) return

    // Try a few episodes to find one with markdown content
    for (let i = 0; i < Math.min(count, 3); i++) {
      const href = await episodeLinks.nth(i).getAttribute('href')
      if (!href) continue

      await page.goto(href)
      const article = page.locator('article')
      const articleExists = await article.count()
      if (articleExists > 0) {
        // Article should have some text content
        const text = await article.textContent()
        expect(text?.trim().length).toBeGreaterThan(0)
        return
      }
    }
  })

  test('episode URLs follow /show/{number}/{slug} pattern', async ({ page }) => {
    await page.goto('/')
    const episodeLinks = page.locator('nav.episodes_list ul#menu li a[role="menuitem"]')
    const count = await episodeLinks.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < Math.min(count, 5); i++) {
      const href = await episodeLinks.nth(i).getAttribute('href')
      expect(href).toMatch(/^\/show\/\d+\/[\w-]+\/?$/)
    }
  })

  test('episode description is shown on episode page', async ({ page }) => {
    await page.goto('/')
    // The homepage shows the latest episode with its description
    const description = page.locator('article p')
    const count = await description.count()
    expect(count).toBeGreaterThan(0)
    const text = await description.first().textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })
})

test.describe('Nicole Kim credit', () => {
  test('footer credits Nicole Kim', async ({ page }) => {
    await page.goto('/')
    const nicoleLink = page.locator('a[href*="nicolejuhyunkim"]')
    await expect(nicoleLink).toBeAttached()
  })
})
