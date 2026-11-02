import { test } from '@playwright/test'
test('regalo', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await page.goto('/?regalo')
  await page.waitForTimeout(900)
  await page.screenshot({ path: '/tmp/reg1.png' })
  await page.getByRole('button', { name: 'Apri il regalo' }).click()
  await page.waitForTimeout(700)
  await page.screenshot({ path: '/tmp/reg2.png' })
  await page.waitForTimeout(2300)
  await page.screenshot({ path: '/tmp/reg3.png' })
  await page.waitForTimeout(2600)
  await page.screenshot({ path: '/tmp/reg4.png' })
})
