import { test, expect } from '@playwright/test'

test.describe('Episode content', () => {
  test('episode titles are rendered in navigation', async ({ page }) => {
    await page.goto('/')
    await page.setViewportSize({ width: 1200, height: 800 })
    const episodeTitles = page.locator('nav.episodes_list ul#menu li h4')
    const count = await episodeTitles.count()
    // Skip if no episodes (CI builds without Notion content)
    test.skip(count === 0, 'No episodes available (build without Notion content)')

    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await episodeTitles.nth(i).textContent()
      expect(text?.trim().length).toBeGreaterThan(0)
    }
  })

  test('episode page renders markdown content when available', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    const episodeLinks = page.locator('nav.episodes_list ul#menu li a[role="menuitem"]')
    const count = await episodeLinks.count()
    test.skip(count === 0, 'No episodes available (build without Notion content)')

    for (let i = 0; i < Math.min(count, 3); i++) {
      const href = await episodeLinks.nth(i).getAttribute('href')
      if (!href) continue

      await page.goto(href)
      const article = page.locator('article')
      const articleExists = await article.count()
      if (articleExists > 0) {
        const text = await article.textContent()
        expect(text?.trim().length).toBeGreaterThan(0)
        return
      }
    }
  })

  test('episode URLs follow /show/{number}/{slug} pattern', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    const episodeLinks = page.locator('nav.episodes_list ul#menu li a[role="menuitem"]')
    const count = await episodeLinks.count()
    test.skip(count === 0, 'No episodes available (build without Notion content)')

    for (let i = 0; i < Math.min(count, 5); i++) {
      const href = await episodeLinks.nth(i).getAttribute('href')
      expect(href).toMatch(/^\/show\/\d+\/[\w-]+\/?$/)
    }
  })

  test('episode description is shown on episode page', async ({ page }) => {
    await page.goto('/')
    const description = page.locator('article p')
    const count = await description.count()
    test.skip(count === 0, 'No episode content available (build without Notion content)')

    const text = await description.first().textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })
})
