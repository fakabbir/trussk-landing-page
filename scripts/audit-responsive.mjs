#!/usr/bin/env node
/* Measure mobile layout failures instead of eyeballing them.
 *
 *   npm run build && npx vite preview --port 4319 &
 *   node scripts/audit-responsive.mjs
 *
 * Checks two things a build cannot catch:
 *
 *   1. Horizontal overflow. Reports any element extending past the viewport
 *      that is NOT inside a horizontally scrollable ancestor -- wide tables and
 *      code blocks are meant to scroll in their own container, so flagging
 *      those would bury the real faults. This caught /graphrag/benchmarks
 *      rendering 2897px wide at a 360px viewport: grid children default to
 *      min-width:auto, so one <pre> refused to shrink and widened the page.
 *
 *   2. Tap targets under 24px (WCAG 2.2 SC 2.5.8) and text under 10px.
 *      Inline links inside a sentence are exempt from the target rule and are
 *      expected to appear here; standalone nav links and controls are not.
 *
 * Needs chromium once:  npx playwright install chromium
 */
import { chromium } from 'playwright-core'

const BASE = process.env.AUDIT_BASE || 'http://localhost:4319'
const WIDTHS = [320, 360, 390, 768]
const PAGES = ['/', '/graphrag', '/graphrag/benchmarks', '/graphrag/statistics', '/graphrag/playground']

const browser = await chromium.launch()
let failures = 0

for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(250)
    const r = await page.evaluate((vw) => {
      const bad = []
      for (const el of document.querySelectorAll('body *')) {
        const box = el.getBoundingClientRect()
        if (box.width === 0 || box.height === 0 || box.right <= vw + 1) continue
        let scrollable = false
        for (let p = el.parentElement; p; p = p.parentElement) {
          const ox = getComputedStyle(p).overflowX
          if ((ox === 'auto' || ox === 'scroll') && p.scrollWidth > p.clientWidth) { scrollable = true; break }
        }
        if (!scrollable) bad.push({
          tag: el.tagName.toLowerCase(),
          right: Math.round(box.right),
          text: (el.textContent || '').trim().slice(0, 40),
          cls: (el.className || '').toString().slice(0, 60),
        })
      }
      return { scrollWidth: document.documentElement.scrollWidth, bad: bad.slice(0, 6) }
    }, width)

    if (r.scrollWidth > width + 1 || r.bad.length) {
      failures++
      console.log(`\n[${width}px] ${path}  scrollWidth=${r.scrollWidth}`)
      for (const x of r.bad) console.log(`    <${x.tag}> right=${x.right} "${x.text}" ${x.cls}`)
    }
  }
  await ctx.close()
}

// tap targets and type size, at one representative phone width
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
console.log('')
for (const path of PAGES) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(250)
  const r = await page.evaluate(() => {
    const small = [], tiny = []
    for (const el of document.querySelectorAll('a,button,input,label,summary,[role="button"]')) {
      const b = el.getBoundingClientRect()
      if (b.width === 0 || b.height === 0) continue
      // an inline link inside a paragraph is exempt from the 24px rule
      // an inline link inside a paragraph is exempt from the 24px rule
      const inlineInProse = getComputedStyle(el).display === 'inline' &&
        ['P', 'LI', 'SPAN', 'DD', 'STRONG'].includes(el.parentElement?.tagName)
      // a control wrapped in a label that already meets the size: the label is
      // the target, and tapping it activates the control
      const inBigLabel = el.closest('label') && el.closest('label') !== el &&
        el.closest('label').getBoundingClientRect().height >= 24
      // a caption label whose associated control is itself big enough
      let captionForBigControl = false
      if (el.tagName === 'LABEL') {
        const target = el.htmlFor ? document.getElementById(el.htmlFor)
                                  : el.querySelector('input,textarea,select')
        captionForBigControl = !!target && target.getBoundingClientRect().height >= 24
      }
      if ((b.height < 24 || b.width < 24) && !inlineInProse && !inBigLabel && !captionForBigControl)
        small.push(`${Math.round(b.width)}x${Math.round(b.height)} "${(el.textContent || '').trim().slice(0, 24)}"`)
    }
    for (const el of document.querySelectorAll('body *')) {
      if (el.children.length || !(el.textContent || '').trim()) continue
      const fs = parseFloat(getComputedStyle(el).fontSize)
      if (fs < 10) tiny.push(`${fs}px "${(el.textContent || '').trim().slice(0, 24)}"`)
    }
    return { small, tiny }
  })
  console.log(`${path}: tap<24px=${r.small.length} font<10px=${r.tiny.length}`)
  for (const x of r.small.slice(0, 6)) console.log(`    ${x}`)
  for (const x of r.tiny.slice(0, 4)) console.log(`    ${x}`)
  failures += r.small.length + r.tiny.length
}

await browser.close()
console.log(failures ? `\n${failures} issues` : '\nclean at every width')
process.exit(failures ? 1 : 0)
