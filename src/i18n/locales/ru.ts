import type { LocaleStrings } from '../index'

/**
 * Русский. Keys and order as in en.ts.
 *
 * Where English gets away with one/other, Russian needs one/few/many — "1 день", "2 дня",
 * "5 дней". Where a plural would also force a gender agreement, the phrase is rebuilt to
 * put the number after a colon instead: "Осталось открытых: 3" is natural and correct for
 * every number, which "Осталась 1 открытая цель" is not without more forms than the
 * category system has.
 */
const STRINGS: LocaleStrings = {
  nav_main: 'Главное',
  nav_today: 'Сегодня',
  nav_year: 'Год',
  nav_plan: 'План',
  nav_years: 'Годы',
  nav_profile: 'Профиль',

  today_title: 'Сегодня',
  streak_days: { one: 'день подряд', few: 'дня подряд', many: 'дней подряд', other: 'дня подряд' },
  today_blocks_done: '{done}/{total} сегодня',
  today_focus: 'Фокус: {month}',
  today_open: 'Осталось в этом месяце',
  today_slots: 'Слоты времени',
  today_no_plan: 'Нет плана на {year}',
  today_no_plan_hint: 'Сохранённый план — на {year} год.',
  today_add: 'Добавить на сегодня',
  today_done_today: 'Сделано сегодня',
  add_tab_move: 'Перенести сюда',
  add_done_already: 'Я это уже сделал',

  year_eyebrow: 'Цели',
  year_search: 'Поиск по {year}',
  filter_all: 'Все',
  filter_open: 'Открытые',
  filter_done: 'Готовые',
  year_empty: 'Пусто',
  year_empty_search: 'Ничего не найдено.',
  year_empty_hint: 'Добавьте первую ниже.',
  year_add: 'Добавить цель в {year}',
  search_clear: 'Очистить поиск',
  add_goal: 'Новая цель',
  add_placeholder: 'Что хочешь сделать?',
  month_custom_placeholder: 'Чего нет в списке',

  cat_tech: 'Технологии',
  cat_lang: 'Языки',
  cat_money: 'Деньги',
  cat_health: 'Здоровье',
  cat_life: 'Жизнь',
  cat_project: 'Проекты',

  plan_eyebrow: 'План',
  plan_total: 'Запланировано: {amount}',
  plan_now: 'сейчас',
  plan_edit: 'Изменить',
  plan_edit_month: 'Изменить: {month}',
  plan_focus: 'Фокус',
  plan_langs: 'Языки',
  plan_money: 'Деньги',

  archive_eyebrow: 'Архив',
  archive_title: 'Годы',
  archive_summary: {
    one: 'Достигнуто {done} за {years} год',
    few: 'Достигнуто {done} за {years} года',
    many: 'Достигнуто {done} за {years} лет',
    other: 'Достигнуто {done} за {years} лет',
  },
  archive_search: 'Поиск по всем годам',
  archive_no_match: 'Ничего не найдено',
  archive_no_match_hint: 'Ни в одном году нет совпадений с «{query}».',
  archive_done_of: '{done} из {total} готово',
  archive_someday: { other: 'Когда-нибудь: {total}' },
  backlog: 'Бэклог',

  bucket_all_met: 'Все цели этого года достигнуты.',
  bucket_left_open: { other: 'Осталось открытых: {n}.' },
  bucket_backlog_blurb:
    'Здесь ничего не запланировано. Перенесите пункт в год, когда он перестанет быть «когда-нибудь».',
  bucket_empty: 'Пусто',
  bucket_empty_hint: 'В этом году пока нет целей.',
  bucket_add: 'Добавить в {bucket}',
  bucket_unknown: 'Неизвестный год',
  bucket_unknown_hint: 'Такого года в приложении нет.',

  goal_title_label: 'Название цели',
  goal_category: 'Категория',
  goal_year: 'Год',
  goal_delete_confirm: 'Удалить «{title}»?',

  common_add: 'Добавить',
  common_cancel: 'Отмена',
  common_delete: 'Удалить',
  common_done: 'Готово',
  common_hide: 'Скрыть',
  common_ok: 'ОК',
  common_save: 'Сохранить',

  profile_eyebrow: 'Профиль',
  profile_record: 'Ваш результат',
  profile_goals_met: 'целей достигнуто',
  profile_tracked: 'всего целей',
  profile_days_logged: 'дней отмечено',
  profile_theme: 'Тема',
  theme_system: 'Системная',
  theme_light: 'Светлая',
  theme_dark: 'Тёмная',
  profile_language: 'Язык',
  lang_system: 'Системный',
  profile_data: 'Ваши данные',
  profile_data_note:
    'Ваши цели хранятся только на этом устройстве. Нет аккаунта и нет копии в облаке — поэтому файл копии единственный способ перенести их на другой телефон.',
  profile_export: 'Экспорт копии',
  profile_export_csv: 'Экспорт CSV',
  profile_import: 'Импорт копии',
  profile_resources: 'Где учиться',
  profile_add_resource: 'Добавить ресурс',
  profile_remove: 'Удалить {name}',
  profile_built: 'Сборка {time}',
  profile_licenses: 'Лицензии открытого ПО',
  profile_licenses_failed: 'Не удалось загрузить список лицензий.',
  metrics_title: 'Отправлять анонимную статистику использования',
  metrics_note:
    'Раз в день: какие экраны и функции использовались, версия приложения, платформа, язык и число ошибок. Без идентификаторов, названий и всего, что вы вводите.',
  metrics_on: 'Включено',
  metrics_off: 'Выключено',
  metrics_notice:
    'GoalsTable раз в день отправляет анонимные счётчики использования — без идентификаторов и без того, что вы вводите. Отключить это можно в Профиле.',

  toast_added: 'Добавлено в {bucket}',
  toast_moved: 'Добавлено в {month}',
  toast_saved_downloads: 'Сохранено в загрузки',
  toast_export_failed: 'Не удалось экспортировать',
  toast_not_backup: 'Это не резервная копия GoalsTable',
  toast_unreadable: 'Не удалось прочитать файл',
  toast_restored: 'Копия восстановлена',
  toast_write_failed: 'Не удалось сохранить — сделайте копию в профиле',
  confirm_replace: 'Заменить всё в приложении этой копией ({count} целей)?',
  confirm_replace_action: 'Заменить',

  projects_title: 'Другие проекты автора',
  projects_all: 'Все продукты →',
  type_web: 'Веб-приложение',
  type_ios: 'Приложение для iOS',
  type_desktop: 'Приложение для компьютера',
  type_extension: 'Расширение',
  status_live: 'Доступно',
  status_beta: 'Бета',
  status_open_source: 'Открытый код',

  support_title: 'Поддержать',
  support_note: 'GoalsTable бесплатен и без рекламы. Если он вам полезен, его можно поддержать:',
}

export default STRINGS
