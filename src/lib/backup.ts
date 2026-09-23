import { exportJsonFile, isNativeApp, type ExportOutcome } from 'tables-core'
import { useGoals } from '../store/goals'
import { usePlan } from '../store/plan'
import type { Goal, MonthPlan, RoutineBlock, TimeSlot } from './types'
import { native } from './native'

/**
 * Export and import. The app keeps everything on the device and talks to no server, which
 * makes a file the only way the data leaves — to another phone, or to a copy kept
 * somewhere safe. Seven years of records deserve a way out that does not depend on this
 * app still existing.
 */

export interface BackupFile {
  app: 'goalstable'
  version: 1
  exportedAt: string
  goals: Goal[]
  plan: {
    year: number
    months: MonthPlan[]
    blocks: RoutineBlock[]
    slots: TimeSlot[]
    resources: string[]
    log: Record<string, string[]>
  }
}

export function buildBackup(): BackupFile {
  const { goals } = useGoals.getState()
  const { year, months, blocks, slots, resources, log } = usePlan.getState()
  return {
    app: 'goalstable',
    version: 1,
    exportedAt: new Date().toISOString(),
    goals: Object.values(goals),
    plan: { year, months, blocks, slots, resources, log },
  }
}

export function isValidBackup(data: unknown): data is BackupFile {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Partial<BackupFile>
  return d.app === 'goalstable' && d.version === 1 && Array.isArray(d.goals) && typeof d.plan === 'object'
}

export function applyBackup(backup: BackupFile): void {
  useGoals.getState().replaceAll(backup.goals)
  usePlan.getState().replaceAll(backup.plan)
}

function stamp(ext: string): string {
  return `goalstable-${new Date().toISOString().slice(0, 10)}.${ext}`
}

/** The whole app, as one file. `tables-core` handles the per-platform delivery. */
export function exportBackup(): Promise<ExportOutcome> {
  return exportJsonFile(buildBackup(), stamp('json'), native)
}

/**
 * The goals as spreadsheet rows, for anyone who wants them back in Sheets. The tick is
 * TRUE/FALSE so Sheets reads it as a checkbox rather than as text — which is how it was
 * stored in the sheet this app was built from.
 */
export function buildCsv(): string {
  const rows = [['bucket', 'title', 'done', 'category', 'doneAt']]
  for (const goal of Object.values(useGoals.getState().goals)) {
    rows.push([
      String(goal.bucket),
      goal.title,
      goal.done ? 'TRUE' : 'FALSE',
      goal.category,
      goal.doneAt?.slice(0, 10) ?? '',
    ])
  }
  return rows
    .map((row) => row.map((cell) => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join(','))
    .join('\n')
}

/**
 * The CSV route, which mirrors `exportJsonFile`'s platform split rather than reusing it:
 * that function stringifies its argument as JSON, so a CSV string would arrive quoted.
 * The split itself is the same one, and for the same reason — `<a download>` does nothing
 * under `capacitor://`, so natively the file is written and handed to the share sheet.
 */
export async function exportCsv(): Promise<ExportOutcome> {
  const fileName = stamp('csv')
  const csv = buildCsv()

  if (isNativeApp()) {
    try {
      await native.fs.writeFile({
        path: fileName,
        data: csv,
        directory: native.cacheDirectory,
        encoding: native.encoding,
        recursive: true,
      })
      const { uri } = await native.fs.getUri({ path: fileName, directory: native.cacheDirectory })
      await native.share.share({ title: fileName, files: [uri] })
      return 'shared'
    } catch (err) {
      // Dismissing the sheet rejects here as well, and that is a normal answer.
      const message = err instanceof Error ? err.message : String(err)
      return /cancel|abort|dismiss/i.test(message) ? 'cancelled' : 'failed'
    }
  }

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
  return 'downloaded'
}
