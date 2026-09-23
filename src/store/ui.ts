import { create } from 'zustand'

/**
 * Transient interface state: the toast and the confirm dialog. Nothing here is persisted —
 * it exists so that any module, including the storage layer, can raise a message without
 * importing React.
 */

interface ConfirmRequest {
  message: string
  confirmLabel: string
  destructive: boolean
  resolve: (ok: boolean) => void
}

interface UiState {
  toast: string | null
  confirm: ConfirmRequest | null
  showToast: (message: string) => void
  dismissToast: () => void
  askConfirm: (message: string, options?: { confirmLabel?: string; destructive?: boolean }) => Promise<boolean>
  answerConfirm: (ok: boolean) => void
}

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useUi = create<UiState>()((set, get) => ({
  toast: null,
  confirm: null,
  showToast: (toast) => {
    clearTimeout(toastTimer)
    set({ toast })
    toastTimer = setTimeout(() => set({ toast: null }), 3200)
  },
  dismissToast: () => {
    clearTimeout(toastTimer)
    set({ toast: null })
  },
  askConfirm: (message, options) =>
    new Promise<boolean>((resolve) => {
      set({
        confirm: {
          message,
          confirmLabel: options?.confirmLabel ?? 'OK',
          destructive: options?.destructive ?? false,
          resolve,
        },
      })
    }),
  answerConfirm: (ok) => {
    get().confirm?.resolve(ok)
    set({ confirm: null })
  },
}))
