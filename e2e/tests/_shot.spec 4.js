import { test } from '@playwright/test'
for (const [w, h, nome] of [[390, 664, 'iphone'], [375, 553, 'se'], [360, 640, 'android']]) {
  test(nome, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h })
    await page.goto('/?regalo')
    await page.waitForTimeout(800)
    await page.screenshot({ path: `/tmp/t-${nome}-0.png` })
    await page.getByRole('button', { name: 'Apri il regalo' }).click({ force: true })
    await page.waitForTimeout(6200)
    await page.screenshot({ path: `/tmp/t-${nome}-1.png` })
    await page.getByRole('button', { name: 'Gira il biglietto ↻' }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `/tmp/t-${nome}-2.png` })
    console.log(nome, JSON.stringify(await page.evaluate(() => { const v = document.querySelector('.reg-velo'); const b = document.querySelector('.reg-biglietto').getBoundingClientRect(); const a = document.querySelector('.reg-azioni').getBoundingClientRect(); return { sl: v.scrollLeft, st: v.scrollTop, sw: v.scrollWidth, cw: v.clientWidth, sh: v.scrollHeight, ch: v.clientHeight, cartaTop: Math.round(b.top), cartaBottom: Math.round(b.bottom), bottoniBottom: Math.round(a.bottom) } })))
  })
}
