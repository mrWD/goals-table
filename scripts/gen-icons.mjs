import { mkdir, readFile } from 'node:fs/promises'
import sharp from 'sharp'

/**
 * Every raster icon, from the one `public/favicon.svg`.
 *
 * The art carries its own background now, so the maskable icon is simply the full render:
 * the ring sits inside the middle 68% of the canvas, well within the safe zone a launcher
 * crops to, and padding it again would leave a tiny ring on a slab of blue.
 */
const svg = await readFile(new URL('../public/favicon.svg', import.meta.url))
await mkdir(new URL('../public/icons', import.meta.url), { recursive: true })

const out = (name) => new URL(`../public/icons/${name}`, import.meta.url).pathname
const render = (size) => sharp(svg, { density: 400 }).resize(size, size).png()

await render(192).toFile(out('icon-192.png'))
await render(512).toFile(out('icon-512.png'))
await render(512).toFile(out('icon-maskable-512.png'))
// Apple flattens against black where an icon has alpha; this art has none, but the
// explicit flatten keeps that guaranteed if the source ever gains transparency.
await sharp(svg, { density: 400 }).resize(180, 180).flatten({ background: '#2f5fe0' })
  .png().toFile(out('apple-touch-icon.png'))

console.log('icons generated')
