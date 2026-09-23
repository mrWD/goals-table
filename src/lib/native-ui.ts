import { App as CapApp } from '@capacitor/app'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { isNativeApp } from 'tables-core'

/**
 * The small pieces that make the wrapped app feel like an app rather than a page.
 * Everything here is a no-op in a browser, guarded explicitly rather than relying on the
 * plugins' web fallbacks so a future plugin swap cannot quietly start throwing.
 */

/**
 * The status bar icons, matched to what is actually painted behind them.
 *
 * Measured on Android 16 in the sibling trackers: the web view is inset top and bottom,
 * and those strips are painted from the `DayNight` theme — they follow the **system** dark
 * mode and ignore the theme chosen inside the app. So the icons follow the system too.
 * Driving them from the app's theme is the intuitive thing to write and produces white
 * icons on a white strip the moment someone picks Dark on a light phone.
 */
export function syncStatusBar(): void {
  if (!isNativeApp()) return
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  // Naming trap: Capacitor's `Style.Dark` means "drawn for a dark background", i.e. light
  // icons — not "dark icons".
  void StatusBar.setStyle({ style: systemDark ? Style.Dark : Style.Light }).catch(() => {})
}

/** The splash stays up (launchAutoHide: false) until hydration has something to show. */
export function hideSplash(): void {
  if (!isNativeApp()) return
  void SplashScreen.hide().catch(() => {})
}

/**
 * Android's back button. Inside the app's own history it goes back; at the root it
 * minimises rather than exits, so the year is instant on return. iOS never fires this.
 */
export function wireBackButton(): void {
  if (!isNativeApp()) return
  void CapApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back()
    else void CapApp.minimizeApp()
  })
}

/** A light tick for checking a goal off. */
export function tapFeedback(): void {
  if (!isNativeApp()) return
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
}

/** Closing the last block of the day deserves slightly more than a tick. */
export function successFeedback(): void {
  if (!isNativeApp()) return
  void Haptics.notification({ type: NotificationType.Success }).catch(() => {})
}
