import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

/**
 * Android launcher icons, from the same ring.
 *
 * Adaptive icons are two layers: a background the launcher fills, and a foreground it may
 * crop to as little as the middle 66%. So the foreground is the ring alone, on transparency,
 * drawn smaller than in the app icon — at favicon proportions a round mask would shave it.
 * The flat background colour lives in colors.xml; adaptive backgrounds cannot be gradients.
 */
const RES = new URL('../android/app/src/main/res/', import.meta.url)
const BRAND = '#2f5fe0'

const FOREGROUND = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="250" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="76"/>
  <circle cx="512" cy="512" r="250" fill="none" stroke="#ffffff" stroke-width="76"
    stroke-linecap="round" stroke-dasharray="1571" stroke-dashoffset="471"
    transform="rotate(-90 512 512)"/>
</svg>`

const full = await readFile(new URL('../public/favicon.svg', import.meta.url))

// foreground is 108dp; legacy launcher icons are 48dp.
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 }

for (const [density, scale] of Object.entries(DENSITIES)) {
  const dir = new URL(`mipmap-${density}/`, RES).pathname
  await sharp(Buffer.from(FOREGROUND), { density: 400 })
    .resize(Math.round(108 * scale), Math.round(108 * scale))
    .png().toFile(`${dir}/ic_launcher_foreground.png`)

  const legacy = Math.round(48 * scale)
  for (const name of ['ic_launcher.png', 'ic_launcher_round.png']) {
    await sharp(full, { density: 400 }).resize(legacy, legacy).png().toFile(`${dir}/${name}`)
  }
}

const colors = new URL('values/ic_launcher_background.xml', RES).pathname
await writeFile(
  colors,
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${BRAND}</color>\n</resources>\n`,
)

console.log('android icons generated')
