import { test } from '@playwright/test'
test('regalo', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await page.goto('/?regalo')
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Apri il regalo' }).click({ force: true })
  await page.waitForTimeout(6200)
  await page.screenshot({ path: '/tmp/rf1.png' })
  await page.getByRole('button', { name: 'Gira il biglietto ↻' }).click()
  await page.waitForTimeout(550)
  await page.screenshot({ path: '/tmp/rf2.png' })
  await page.waitForTimeout(900)
  await page.screenshot({ path: '/tmp/rf3.png' })
})
