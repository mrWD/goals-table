import type { CapacitorConfig } from '@capacitor/cli'

/**
 * The native shell around the same Vite build the web gets.
 *
 * `webDir` is the ordinary `dist`: nothing is built twice, and a native release is
 * whatever `npm run build:native` produced plus `npx cap sync`. The app uses
 * `HashRouter`, so routing needs no adjustment for the `capacitor://localhost` origin
 * the WebView serves from.
 *
 * `androidScheme: 'https'` keeps Android on `https://localhost` rather than the legacy
 * `http://`, which is what makes the WebView treat the app as a secure context — crypto
 * and IndexedDB persistence both depend on it.
 */
const config: CapacitorConfig = {
  appId: 'com.mrwd.goalstable',
  appName: 'GoalsTable',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    // The app draws its own background; without this the WebView flashes white on
    // launch in dark mode before the first paint.
    backgroundColor: '#f4f5f7',
  },
  android: {
    backgroundColor: '#f4f5f7',
  },
  plugins: {
    SplashScreen: {
      // Goals are read from a file before the first render, so there is a moment with
      // nothing to show. Auto-hiding on a timer would either cut that short or outlast
      // it; main.tsx hides the splash when the render actually happens.
      launchAutoHide: false,
      backgroundColor: '#f4f5f7',
      androidSplashResourceName: 'splash',
    },
  },
}

export default config
