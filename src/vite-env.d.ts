/// <reference types="vite/client" />

declare const __BUILD_TIME__: string

interface ImportMetaEnv {
  /** Where `lib/metrics` sends its daily ping; unset means production. */
  readonly VITE_METRICS_URL?: string
}
