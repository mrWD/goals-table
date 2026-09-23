import { useMemo, useRef } from 'react'
import { Projects } from '../components/Projects'
import { SupportLinks } from '../components/Support'
import { UI_LANGS, type LangCode } from '../i18n'
import { applyBackup, exportBackup, exportCsv, isValidBackup } from '../lib/backup'
import { number } from '../lib/format'
import { isYear } from '../lib/types'
import { statsFor, useGoals } from '../store/goals'
import { useLang, useLocale, useT, type LangChoice } from '../store/lang'
import { usePlan } from '../store/plan'
import { useTheme, type ThemeChoice } from '../store/theme'
import { useUi } from '../store/ui'

const THEMES: ThemeChoice[] = ['system', 'light', 'dark']

export default function ProfilePage() {
  const goals = useGoals((s) => s.goals)
  const { resources, addResource, removeResource, log } = usePlan()
  const { theme, setTheme } = useTheme()
  const { choice: langChoice, setLang } = useLang()
  const showToast = useUi((s) => s.showToast)
  const askConfirm = useUi((s) => s.askConfirm)
  const fileRef = useRef<HTMLInputElement>(null)
  const t = useT()
  const locale = useLocale()

  const all = useMemo(() => Object.values(goals), [goals])
  const lifetime = statsFor(all.filter((g) => isYear(g.bucket)))
  const daysLogged = Object.keys(log).length

  const themeLabel: Record<ThemeChoice, string> = {
    system: t('theme_system'),
    light: t('theme_light'),
    dark: t('theme_dark'),
  }

  const onExport = async (kind: 'json' | 'csv') => {
    const outcome = await (kind === 'json' ? exportBackup() : exportCsv())
    // 'cancelled' is the person closing the share sheet — saying anything would be noise.
    if (outcome === 'failed') showToast(t('toast_export_failed'))
    else if (outcome === 'downloaded') showToast(t('toast_saved_downloads'))
  }

  const onImport = async (file: File) => {
    try {
      const data = JSON.parse(await file.text())
      if (!isValidBackup(data)) {
        showToast(t('toast_not_backup'))
        return
      }
      const ok = await askConfirm(t('confirm_replace', { count: data.goals.length }), {
        confirmLabel: t('confirm_replace_action'),
        destructive: true,
      })
      if (!ok) return
      applyBackup(data)
      showToast(t('toast_restored'))
    } catch {
      showToast(t('toast_unreadable'))
    }
  }

  return (
    <main className="page">
      <header className="page-head">
        <p className="eyebrow">{t('profile_eyebrow')}</p>
        <h1>GoalsTable</h1>
      </header>

      <section className="card">
        <h2 className="card-head">{t('profile_record')}</h2>
        <div className="stat-row">
          <div className="stat">
            <strong>{number(lifetime.done, locale)}</strong>
            <span>{t('profile_goals_met')}</span>
          </div>
          <div className="stat">
            <strong>{number(all.length, locale)}</strong>
            <span>{t('profile_tracked')}</span>
          </div>
          <div className="stat">
            <strong>{number(daysLogged, locale)}</strong>
            <span>{t('profile_days_logged')}</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="card-head">{t('profile_language')}</h2>
        {/*
          A native <select> rather than twenty chips: it is the control the OS already gives
          a long list, it scrolls, and on a phone it opens the system picker — which is the
          one place a language list is expected to appear.
        */}
        <select
          className="lang-select"
          value={langChoice}
          onChange={(e) => void setLang(e.target.value as LangChoice)}
          aria-label={t('profile_language')}
        >
          <option value="system">{t('lang_system')}</option>
          {(Object.keys(UI_LANGS) as LangCode[]).map((code) => (
            // Each language is labelled in itself, so it is recognisable to someone who
            // cannot read the language the interface is currently in.
            <option key={code} value={code}>
              {UI_LANGS[code]}
            </option>
          ))}
        </select>
      </section>

      <section className="card">
        <h2 className="card-head">{t('profile_theme')}</h2>
        <div className="chips">
          {THEMES.map((value) => (
            <button
              key={value}
              type="button"
              className={`chip${theme === value ? ' is-active' : ''}`}
              onClick={() => setTheme(value)}
            >
              {themeLabel[value]}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="card-head">{t('profile_data')}</h2>
        <p className="card-note">{t('profile_data_note')}</p>
        <div className="button-row">
          <button type="button" className="btn" onClick={() => onExport('json')}>
            {t('profile_export')}
          </button>
          <button type="button" className="btn" onClick={() => onExport('csv')}>
            {t('profile_export_csv')}
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            {t('profile_import')}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            // Cleared so choosing the same file twice in a row fires change again.
            e.target.value = ''
            if (file) void onImport(file)
          }}
        />
      </section>

      <section className="card">
        <h2 className="card-head">{t('profile_resources')}</h2>
        <ul className="resources">
          {resources.map((r) => (
            <li key={r}>
              <span>{r}</span>
              <button type="button" onClick={() => removeResource(r)} aria-label={t('profile_remove', { name: r })}>
                ×
              </button>
            </li>
          ))}
        </ul>
        <form
          className="inline-add"
          onSubmit={(e) => {
            e.preventDefault()
            const input = e.currentTarget.elements.namedItem('resource') as HTMLInputElement
            if (!input.value.trim()) return
            addResource(input.value)
            input.value = ''
          }}
        >
          <input name="resource" placeholder={t('profile_add_resource')} aria-label={t('profile_add_resource')} />
          <button type="submit" className="btn btn-primary">
            {t('common_add')}
          </button>
        </form>
      </section>

      <Projects />

      <SupportLinks />

      <p className="build">{t('profile_built', { time: __BUILD_TIME__ })}</p>
    </main>
  )
}
