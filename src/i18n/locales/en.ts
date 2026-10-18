/**
 * English — the master list. Every other locale copies these keys in this order.
 *
 * A value is either a string or, where a count decides the wording, an object of plural
 * forms keyed by the categories `Intl.PluralRules` returns for that language. Only `other`
 * is required; a language that needs `one`, `few` or `many` adds them.
 *
 * What is NOT here, on purpose: goal titles, month focus text, the routine block labels,
 * resource names. Those are the user's own data — English demo content on first run, then
 * whatever they write — and translating them would overwrite what they wrote.
 */

export const STRINGS = {
  nav_main: 'Main',
  nav_today: 'Today',
  nav_year: 'Year',
  nav_plan: 'Plan',
  nav_years: 'Years',
  nav_profile: 'Profile',

  today_title: 'Today',
  // The count is rendered separately, large, next to this label — so the label carries no
  // {n}. It still receives one, because that is what picks the form in Russian or Polish.
  streak_days: { one: 'day in a row', other: 'days in a row' },
  today_blocks_done: '{done}/{total} today',
  today_focus: '{month} focus',
  today_open: 'Still open from this month',
  today_slots: 'Time slots',
  today_no_plan: 'No plan for {year}',
  today_no_plan_hint: 'The stored plan is for {year}.',
  today_add: 'Add to today',
  today_done_today: 'Done today',
  add_tab_move: 'Move here',
  add_done_already: 'I have already done this',

  year_eyebrow: 'Goals',
  year_search: 'Search {year}',
  filter_all: 'All',
  filter_open: 'Open',
  filter_done: 'Done',
  year_empty: 'Nothing here',
  year_empty_search: 'No goal matches that search.',
  year_empty_hint: 'Add the first one below.',
  year_add: 'Add a goal to {year}',
  search_clear: 'Clear search',
  add_goal: 'New goal',
  add_placeholder: 'What do you want to do?',
  month_custom_placeholder: 'Something not on the list',

  cat_tech: 'Tech',
  cat_lang: 'Languages',
  cat_money: 'Money',
  cat_health: 'Health',
  cat_life: 'Life',
  cat_project: 'Projects',

  plan_eyebrow: 'Plan',
  plan_total: 'Planned: {amount}',
  plan_now: 'now',
  plan_edit: 'Edit',
  plan_edit_month: 'Edit {month}',
  plan_focus: 'Focus',
  plan_langs: 'Languages',
  plan_money: 'Money',

  archive_eyebrow: 'Archive',
  archive_title: 'Years',
  archive_summary: { one: '{done} done across {years} year', other: '{done} done across {years} years' },
  archive_search: 'Search every year',
  archive_no_match: 'No match',
  archive_no_match_hint: 'Nothing in any year matches “{query}”.',
  archive_done_of: '{done} of {total} done',
  archive_someday: { one: '{total} someday', other: '{total} someday' },
  backlog: 'Backlog',

  bucket_all_met: 'Every goal of this year was met.',
  bucket_left_open: { one: '{n} left open.', other: '{n} left open.' },
  bucket_backlog_blurb:
    'Nothing here is scheduled. Move an item into a year when it stops being someday.',
  bucket_empty: 'Empty',
  bucket_empty_hint: 'No goals in this year yet.',
  bucket_add: 'Add to {bucket}',
  bucket_unknown: 'Unknown year',
  bucket_unknown_hint: 'That address does not match a year in the app.',

  goal_title_label: 'Goal title',
  goal_category: 'Category',
  goal_year: 'Year',
  goal_delete_confirm: 'Delete “{title}”?',

  common_add: 'Add',
  common_cancel: 'Cancel',
  common_delete: 'Delete',
  common_done: 'Done',
  common_hide: 'Hide',
  common_ok: 'OK',
  common_save: 'Save',

  profile_eyebrow: 'Profile',
  profile_record: 'Your record',
  profile_goals_met: 'goals met',
  profile_tracked: 'tracked',
  profile_days_logged: 'days logged',
  profile_theme: 'Theme',
  theme_system: 'System',
  theme_light: 'Light',
  theme_dark: 'Dark',
  profile_language: 'Language',
  // Its own key rather than reusing theme_system: in a gendered language "system" agrees
  // with the noun, and "system theme" and "system language" do not take the same form.
  lang_system: 'System',
  profile_data: 'Your data',
  profile_data_note:
    'Everything lives on this device. There is no account and no server — so a backup file is the only way it reaches another phone.',
  profile_export: 'Export backup',
  profile_export_csv: 'Export CSV',
  profile_import: 'Import backup',
  profile_resources: 'Where to learn',
  profile_add_resource: 'Add a resource',
  profile_remove: 'Remove {name}',
  profile_built: 'Built {time}',
  profile_licenses: 'Open-source licences',
  profile_licenses_failed: 'The list of licences could not be loaded.',

  toast_added: 'Added to {bucket}',
  toast_moved: 'Added to {month}',
  toast_saved_downloads: 'Saved to your downloads',
  toast_export_failed: 'Export failed',
  toast_not_backup: 'That is not a GoalsTable backup',
  toast_unreadable: 'Could not read that file',
  toast_restored: 'Backup restored',
  toast_write_failed: 'Saving failed — export a backup from Profile',
  confirm_replace: 'Replace everything in the app with this backup ({count} goals)?',
  confirm_replace_action: 'Replace',

  projects_title: 'More from the author',
  projects_all: 'All products →',
  type_web: 'Web app',
  type_ios: 'iOS app',
  type_desktop: 'Desktop app',
  type_extension: 'Extension',
  status_live: 'Live',
  status_beta: 'Beta',
  status_open_source: 'Open source',

  support_title: 'Support',
  support_note:
    'GoalsTable is free, has no ads and collects nothing. If it is useful to you, you can support it:',
}

export default STRINGS
