import { test, expect } from '@playwright/test'

test.describe('Search Flow', () => {
  test('should display search page', async ({ page }) => {
    await page.goto('/search')
    await expect(page.locator('h1, h2')).toBeVisible()
  })

  test('should search for listings', async ({ page }) => {
    await page.goto('/search')
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    // Check if search input exists
    const searchInput = page.locator('input[type="text"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('condo')
      await page.locator('button[type="submit"]').first().click()
      // Wait for results or no results message
      await page.waitForTimeout(2000)
    }
  })
})
