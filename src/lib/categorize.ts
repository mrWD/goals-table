import type { Category } from './types'

/**
 * Seven years of rows arrived from the spreadsheet as plain strings in a column, with no
 * category on them, so the category is read out of the title.
 *
 * The order of these tests is the whole design, and each swap below was forced by a real
 * row:
 *
 * - **project before language**, or "AI Lang Tutor" — a shipped app — files itself under
 *   Languages along with "Italian B2".
 * - **money before language**, or "German Taxes" files itself under Languages.
 * - **health before life**, or "Go to the Gym" matches the "go to" of "Go to Italy for 3
 *   months" and becomes a relocation.
 *
 * Anything unmatched is tech, which is what most of the sheet is.
 */

const PRODUCTS =
  /memora|pumpup|doublesubtitles|double subtitles|double captions|aipromptsuggester|screen translator|\bai rts\b|job search|lang tutor|language tutor|issues? resolver|second brain|scraper|movie table|game table|books table|langs db|science timeline/i

const PROJECT = /^publish |pet project|made my (app|video)|extension|\bext\b|\bvideos?\b|create ios app/i

const MONEY = /\$|salary|million|mortgage|investment|financial|save money|\btaxes\b/i

const HEALTH =
  /gym|dead lift|squad|pull ups?|\bkg\b|loose \d|healthy|stretching|endurance|vol+ey?ball|\bsport\b|\bdiet\b|good fit/i

const LIFE = /\bmoved?\b|moving|travel|\btrip\b|wedding|blue card|abroad|another city|^go to /i

const LANG =
  /german|italian|spanish|french|polish|dutch|english|serbian|czech|bulgarian|nederlan|chinese|japanese|arabic|turkish|language|\blangs?\b|phrases/i

export function categorize(title: string): Category {
  if (PRODUCTS.test(title) || PROJECT.test(title)) return 'project'
  if (MONEY.test(title)) return 'money'
  if (HEALTH.test(title)) return 'health'
  if (LIFE.test(title)) return 'life'
  if (LANG.test(title)) return 'lang'
  return 'tech'
}
