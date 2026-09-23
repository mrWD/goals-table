import { readFile } from 'node:fs/promises'
import sharp from 'sharp'

/**
 * The single 1024×1024 marketing icon iOS asks for, from the app's own favicon.
 *
 * `cap add ios` leaves Capacitor's placeholder logo in the asset catalogue, which is what
 * would otherwise appear on the TestFlight listing and every tester's home screen.
 *
 * Flattened onto the brand colour on purpose: the App Store rejects a marketing icon that
 * carries an alpha channel, and a transparent one also renders black on some surfaces.
 */
const BRAND = '#2f5fe0'
const svg = await readFile(new URL('../public/favicon.svg', import.meta.url))
const out = new URL(
  '../ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
  import.meta.url,
).pathname

await sharp(svg, { density: 400 })
  .resize(1024, 1024)
  .flatten({ background: BRAND })
  .png()
  .toFile(out)

console.log('ios marketing icon written')
