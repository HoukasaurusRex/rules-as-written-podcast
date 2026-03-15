import type { Page } from '@playwright/test'

export const DESKTOP = { width: 1200, height: 800 }
export const MOBILE = { width: 375, height: 667 }

export const authenticateParty = async (
  page: Page,
  partyId: string,
  partyCode: string,
) => {
  await page.evaluate(
    ([id, code]) => localStorage.setItem(`party-code-${id}`, code),
    [partyId, partyCode],
  )
  await page.reload()
}
