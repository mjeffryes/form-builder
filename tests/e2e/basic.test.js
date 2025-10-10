// Basic E2E test to verify app loads
import { test, expect } from '@playwright/test'

test('app loads with correct title', async ({ page }) => {
  await page.goto('/')

  // Check that the page title is correct
  await expect(page).toHaveTitle(/Form Builder/)
})

test('displays split-panel layout', async ({ page }) => {
  await page.goto('/')

  // Check left panel exists and has editor content
  const leftPanel = page.getByTestId('left-panel')
  await expect(leftPanel).toBeVisible()
  await expect(leftPanel).toContainText('JSON Schema')

  // Check right panel exists
  const rightPanel = page.getByTestId('right-panel')
  await expect(rightPanel).toBeVisible()
})
