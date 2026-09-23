/**
 * Inline stroke icons at a single 24px grid. Inline rather than a font or a sprite so they
 * inherit `currentColor` and cost no extra request — the app is meant to open offline.
 */

interface IconProps {
  size?: number
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export function TodayIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  )
}

export function YearIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M4 6.5h10M4 12h10M4 17.5h7" />
      <path d="M17 15.5l2 2 3.5-4" />
    </svg>
  )
}

export function PlanIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5h17M8.5 3.5V6.5M15.5 3.5V6.5" />
    </svg>
  )
}

export function ArchiveIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M12 3.5a8.5 8.5 0 1 1-8.4 9.9" />
      <path d="M3.2 8.2l.4 5.2 5-1.2" />
      <path d="M12 8v4.3l2.8 1.7" />
    </svg>
  )
}

export function ProfileIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  )
}

export function CheckIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={2.6} aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

export function PlusIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function SearchIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M15.8 15.8L20.5 20.5" />
    </svg>
  )
}

export function ChevronIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function FlameIcon({ size = 24 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M12 3.5s5.5 4.2 5.5 9a5.5 5.5 0 0 1-11 0c0-2 1-3.4 1-3.4s.6 1.6 1.8 1.6c1.6 0 1.4-3 2.7-7.2z" />
    </svg>
  )
}
