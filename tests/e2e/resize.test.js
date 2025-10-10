// E2E test for resizable editor panel
import { test, expect } from '@playwright/test'

test('editor panel has default width close to 50em', async ({ page }) => {
  await page.goto('/')

  const leftPanel = page.getByTestId('left-panel')
  await expect(leftPanel).toBeVisible()

  // Get the width of the left panel
  const leftPanelBox = await leftPanel.boundingBox()

  // Default should be 50em (approximately 800px with 16px base font)
  // Allow some variance for different viewport sizes
  expect(leftPanelBox.width).toBeGreaterThan(600)
  expect(leftPanelBox.width).toBeLessThan(900)
})

test('editor panel can be resized by dragging', async ({ page }) => {
  await page.goto('/')

  const leftPanel = page.getByTestId('left-panel')
  await expect(leftPanel).toBeVisible()

  // Get initial width
  const initialBox = await leftPanel.boundingBox()
  const initialWidth = initialBox.width

  // Find the resize handle (it's between left and right panel)
  const resizeHandle = page.locator('.resize-handle-vertical')
  await expect(resizeHandle).toBeVisible()

  // Get the position of the resize handle
  const handleBox = await resizeHandle.boundingBox()

  // Drag the handle to the right by 100 pixels
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(handleBox.x + handleBox.width / 2 + 100, handleBox.y + handleBox.height / 2)
  await page.mouse.up()

  // Wait for any animations to complete
  await page.waitForTimeout(100)

  // Get the new width
  const newBox = await leftPanel.boundingBox()
  const newWidth = newBox.width

  // The width should have increased
  expect(newWidth).toBeGreaterThan(initialWidth)
  expect(newWidth).toBeCloseTo(initialWidth + 100, 50) // Allow 50px tolerance
})

test('editor panel respects minimum width constraint', async ({ page }) => {
  await page.goto('/')

  const leftPanel = page.getByTestId('left-panel')
  await expect(leftPanel).toBeVisible()

  // Find the resize handle
  const resizeHandle = page.locator('.resize-handle-vertical')
  await expect(resizeHandle).toBeVisible()

  // Get the position of the resize handle
  const handleBox = await resizeHandle.boundingBox()

  // Try to drag the handle far to the left
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(10, handleBox.y + handleBox.height / 2) // Try to move to nearly 0
  await page.mouse.up()

  // Wait for any animations to complete
  await page.waitForTimeout(100)

  // Get the final width
  const finalBox = await leftPanel.boundingBox()

  // The width should not go below the minimum (300px)
  expect(finalBox.width).toBeGreaterThanOrEqual(300)
})

test('resize handle shows visual feedback on hover', async ({ page }) => {
  await page.goto('/')

  const resizeHandle = page.locator('.resize-handle-vertical')
  await expect(resizeHandle).toBeVisible()

  // Get the handle's initial background color
  const initialBg = await resizeHandle.evaluate(el =>
    window.getComputedStyle(el).backgroundColor
  )

  // Hover over the handle
  await resizeHandle.hover()

  // Get the handle's background color after hover
  const hoverBg = await resizeHandle.evaluate(el =>
    window.getComputedStyle(el).backgroundColor
  )

  // The background should change (not be transparent or the same)
  expect(hoverBg).not.toBe(initialBg)
})
