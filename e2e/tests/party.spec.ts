import { test, expect } from '@playwright/test'
import { MOBILE, authenticateParty } from '../fixtures'

test.describe('Party Tracker - Navigation', () => {
  test('Party link appears in site navigation', async ({ page }) => {
    await page.goto('/')
    const partyLink = page.getByRole('link', { name: /party/i })
    await expect(partyLink.first()).toBeAttached()
  })
})

test.describe('Party Tracker - Create Page', { tag: '@ssr' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/party')
  })

  test('renders party creation form', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toContainText('New Party')

    const input = page.getByLabel(/party name/i)
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute('placeholder', 'The Arcane Adventurers')

    const submit = page.getByRole('button', { name: /create party/i })
    await expect(submit).toBeVisible()
  })

  test('submit button disabled when name is empty', async ({ page }) => {
    const submit = page.getByRole('button', { name: /create party/i })
    await expect(submit).toBeDisabled()
  })

  test('submit button enabled when name entered', async ({ page }) => {
    const input = page.getByLabel(/party name/i)
    // Use pressSequentially to ensure React hydration handles each keystroke
    await input.pressSequentially('Test Party', { delay: 50 })
    const submit = page.getByRole('button', { name: /create party/i })
    await expect(submit).toBeEnabled({ timeout: 10000 })
  })

  test('creates a party and shows code', async ({ page }) => {
    const input = page.getByLabel(/party name/i)
    await input.pressSequentially('E2E Test Party', { delay: 50 })

    const submit = page.getByRole('button', { name: /create party/i })
    await expect(submit).toBeEnabled({ timeout: 10000 })
    await submit.click()

    await expect(page.getByText('Party Created')).toBeVisible({ timeout: 10000 })

    const codeButton = page.locator('[data-testid="party-code"]')
    await expect(codeButton).toBeVisible()
    const codeText = await codeButton.textContent()
    expect(codeText).toMatch(/[A-Z]+-[A-Z]+-\d+/)

    await expect(page.getByText('Share Link')).toBeVisible()
    await expect(page.getByRole('link', { name: /go to party tracker/i })).toBeVisible()
  })
})

test.describe('Party Tracker - Party Page', { tag: '@ssr' }, () => {
  let partyId: string
  let partyCode: string

  test.beforeAll(async ({ request }) => {
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

    await expect(page.locator('h1')).toContainText('E2E Test Party', { timeout: 10000 })
    await expect(page.getByText('Unlock Editing')).toBeVisible()
  })

  test('unlock editing with valid code', async ({ page }) => {
    await page.goto(`/party/${partyId}`)

    await page.getByText('Unlock Editing').click()

    const codeInput = page.getByRole('textbox', { name: /party code/i })
    await expect(codeInput).toBeVisible()
    await codeInput.fill(partyCode)

    await page.getByRole('button', { name: /^unlock$/i }).click()

    await expect(page.getByText('+ Add Character')).toBeVisible({ timeout: 5000 })
  })

  test('shows error for invalid code', async ({ page }) => {
    await page.goto(`/party/${partyId}`)

    await page.getByText('Unlock Editing').click()

    const codeInput = page.getByRole('textbox', { name: /party code/i })
    await codeInput.fill('WRONG-CODE-999')
    await page.getByRole('button', { name: /^unlock$/i }).click()

    await expect(page.getByText('Invalid code')).toBeVisible({ timeout: 5000 })
  })

  test('add character and verify in tab bar', async ({ page }) => {
    await page.goto(`/party/${partyId}`)
    await authenticateParty(page, partyId, partyCode)

    await page.getByText('+ Add Character').click()

    await page.getByLabel(/^name$/i).fill('Gandalf')
    await page.getByLabel(/^class$/i).selectOption('Wizard')
    await page.getByRole('button', { name: /^add$/i }).click()

    await expect(page.getByRole('tab', { name: /gandalf/i })).toBeVisible({ timeout: 5000 })
  })

  test('bottom tab bar visible on mobile viewport', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto(`/party/${partyId}`)

    const partyTab = page.getByRole('tab', { name: /party/i })
    await expect(partyTab).toBeVisible()
  })
})
