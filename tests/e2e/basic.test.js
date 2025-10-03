// Basic E2E test to verify app loads
import { test, expect } from '@playwright/test'

test('app loads and displays Form Builder heading', async ({ page }) => {
  await page.goto('/')

  // Check that the page title is correct
  await expect(page).toHaveTitle(/Form Builder/)

  // Check that the main heading is visible
  const heading = page.getByRole('heading', { name: 'Form Builder' })
  await expect(heading).toBeVisible()
})
