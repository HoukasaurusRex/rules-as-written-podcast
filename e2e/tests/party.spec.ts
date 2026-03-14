import { test, expect } from '@playwright/test'

const isLocalBuild = (process.env.BASE_URL ?? '').includes('localhost')

test.describe('Party Tracker - Navigation', () => {
  // Nav link exists on all pages including static builds
  test('Party link appears in site navigation', async ({ page }) => {
    await page.goto('/')
    // Desktop nav links (hidden on mobile, visible on desktop)
    const partyLink = page.locator('.site-nav-links a[href="/party/new"]')
    // Mobile menu links
    const mobileLink = page.locator('.mobile-menu-links a[href="/party/new"]')
    const either = partyLink.or(mobileLink).first()
    await expect(either).toBeAttached()
  })
})

// SSR pages + API tests require a live server (not a static file server)
test.describe('Party Tracker - Create Page', () => {
  test.skip(isLocalBuild, 'Requires SSR server (skipped in static CI build)')

  test.beforeEach(async ({ page }) => {
    await page.goto('/party/new')
  })

  test('renders party creation form', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toContainText('New Party')

    const input = page.locator('input#party-name')
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute('placeholder', 'The Arcane Adventurers')

    const submit = page.locator('button[type="submit"]')
    await expect(submit).toBeVisible()
    await expect(submit).toContainText('Create Party')
  })

  test('submit button disabled when name is empty', async ({ page }) => {
    const submit = page.locator('button[type="submit"]')
    await expect(submit).toBeDisabled()
  })

  test('submit button enabled when name entered', async ({ page }) => {
    const input = page.locator('input#party-name')
    await input.fill('Test Party')
    const submit = page.locator('button[type="submit"]')
    await expect(submit).toBeEnabled()
  })

  test('creates a party and shows code', async ({ page }) => {
    const input = page.locator('input#party-name')
    await input.fill('E2E Test Party')

    const submit = page.locator('button[type="submit"]')
    await submit.click()

    // Wait for the success state
    await expect(page.locator('text=Party Created')).toBeVisible({ timeout: 10000 })

    // Code should be visible in ADJECTIVE-CREATURE-NUMBER format
    const codeButton = page.locator('button.font-mono')
    await expect(codeButton).toBeVisible()
    const codeText = await codeButton.textContent()
    expect(codeText).toMatch(/[A-Z]+-[A-Z]+-\d+/)

    // Share link should be visible
    await expect(page.locator('text=Share Link')).toBeVisible()

    // Go to party tracker button
    const goButton = page.locator('a:has-text("Go to Party Tracker")')
    await expect(goButton).toBeVisible()
  })
})

test.describe('Party Tracker - Party Page', () => {
  test.skip(isLocalBuild, 'Requires SSR server + database (skipped in static CI build)')

  let partyId: string
  let partyCode: string

  test.beforeAll(async ({ request }) => {
    // Create a test party via API
    const res = await request.post('/api/party', {
      data: { name: 'E2E Test Party' },
    })
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    partyId = data.id
    partyCode = data.code
  })

  test('renders party tracker in read-only mode', async ({ page }) => {
    await page.goto(`/party/${partyId}`)

    // Party name should be visible
    await expect(page.locator('h1')).toContainText('E2E Test Party')

    // Unlock editing button should be visible (not in edit mode)
    await expect(page.locator('text=Unlock Editing')).toBeVisible()
  })

  test('unlock editing with valid code', async ({ page }) => {
    await page.goto(`/party/${partyId}`)

    // Click unlock
    await page.locator('text=Unlock Editing').click()

    // Enter code in modal
    const codeInput = page.locator('input[placeholder="ARCANE-OWLBEAR-42"]')
    await expect(codeInput).toBeVisible()
    await codeInput.fill(partyCode)

    // Submit
    await page.locator('button:has-text("Unlock")').click()

    // Modal should close, edit controls should appear
    await expect(page.locator('text=+ Add Character')).toBeVisible({ timeout: 5000 })
  })

  test('shows error for invalid code', async ({ page }) => {
    await page.goto(`/party/${partyId}`)

    await page.locator('text=Unlock Editing').click()

    const codeInput = page.locator('input[placeholder="ARCANE-OWLBEAR-42"]')
    await codeInput.fill('WRONG-CODE-999')
    await page.locator('button:has-text("Unlock")').click()

    await expect(page.locator('text=Invalid code')).toBeVisible({ timeout: 5000 })
  })

  test('add character and verify in tab bar', async ({ page }) => {
    // Set code in localStorage for edit mode
    await page.goto(`/party/${partyId}`)
    await page.evaluate(
      ([id, code]) => localStorage.setItem(`party-code-${id}`, code),
      [partyId, partyCode],
    )
    await page.reload()

    // Click add character
    await page.locator('text=+ Add Character').click()

    // Fill form
    await page.locator('input#char-name').fill('Gandalf')
    await page.locator('select#char-class').selectOption('Wizard')
    await page.locator('button:has-text("Add")').click()

    // Character should appear in the tab bar
    await expect(page.locator('button[role="tab"]:has-text("Gandalf")')).toBeVisible({ timeout: 5000 })
  })

  test('bottom tab bar visible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(`/party/${partyId}`)

    // Party tab should be visible in bottom bar
    const partyTab = page.locator('button[role="tab"]:has-text("Party")')
    await expect(partyTab).toBeVisible()
  })
})
