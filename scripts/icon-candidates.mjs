import sharp from 'sharp'
const OUT = process.argv[2]

const BG = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#3d70f7"/><stop offset="1" stop-color="#1e45bd"/>
</linearGradient></defs><rect width="1024" height="1024" fill="url(#g)"/>`

// A — the progress ring: the app's own signature element, and the one thing here that is
// not a generic checklist mark. 70% filled, drawn from twelve o'clock like the real one.
const R = 300, C = 2 * Math.PI * R
const a = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${BG}
  <circle cx="512" cy="512" r="${R}" fill="none" stroke="#fff" stroke-opacity="0.25" stroke-width="92"/>
  <circle cx="512" cy="512" r="${R}" fill="none" stroke="#fff" stroke-width="92" stroke-linecap="round"
    stroke-dasharray="${C}" stroke-dashoffset="${C * 0.3}" transform="rotate(-90 512 512)"/>
</svg>`

// B — the year as twelve cells, the shape the plan screen takes on a wide display.
// Seven closed, one current, four still ahead.
const cell = 168, gap = 46
const w = 4 * cell + 3 * gap, x0 = (1024 - w) / 2
const h = 3 * cell + 2 * gap, y0 = (1024 - h) / 2
const state = [1, 1, 1, 1, 1, 1, 1, 2, 0, 0, 0, 0]
const cells = state.map((s, i) => {
  const x = x0 + (i % 4) * (cell + gap), y = y0 + Math.floor(i / 4) * (cell + gap)
  if (s === 1) return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="44" fill="#fff"/>`
  if (s === 2) return `<rect x="${x + 9}" y="${y + 9}" width="${cell - 18}" height="${cell - 18}" rx="38" fill="none" stroke="#fff" stroke-width="18"/>`
  return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="44" fill="#fff" fill-opacity="0.28"/>`
}).join('')
const b = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${BG}${cells}</svg>`

// C — ring plus tick: progress and "done" in one mark. Busier, but unmistakable.
const R2 = 322, C2 = 2 * Math.PI * R2
const c = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${BG}
  <circle cx="512" cy="512" r="${R2}" fill="none" stroke="#fff" stroke-opacity="0.25" stroke-width="64"/>
  <circle cx="512" cy="512" r="${R2}" fill="none" stroke="#fff" stroke-width="64" stroke-linecap="round"
    stroke-dasharray="${C2}" stroke-dashoffset="${C2 * 0.28}" transform="rotate(-90 512 512)"/>
  <path d="M373 520 L470 617 L655 420" fill="none" stroke="#fff" stroke-width="76"
    stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

export const CANDIDATES = { a, b, c }

if (OUT) {
  for (const [name, svg] of Object.entries(CANDIDATES)) {
    await sharp(Buffer.from(svg), { density: 400 })
      .resize(1024, 1024).flatten({ background: '#2f5fe0' }).png()
      .toFile(`${OUT}/icon-${name}.png`)
  }
  console.log('three candidates rendered')
}
