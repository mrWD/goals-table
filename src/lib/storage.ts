import { createDeviceStorage } from 'tables-core'
import { t } from '../store/lang'
import { useUi } from '../store/ui'
import { native } from './native'

/**
 * The app's one storage instance. The adapter lives in `tables-core`, shared with
 * FilmTable, GamesTable and BooksTable; what belongs here is the database name, the native
 * plugins to hand it, and what a failed write should say to this app's user.
 *
 * In a browser this is IndexedDB. In the native app it is a file in private app storage,
 * which the OS cannot reclaim the way it reclaims a WebView's site data — and seven years
 * of ticked goals is not something to lose to an "Offload App".
 */
export const deviceStorage = createDeviceStorage({
  dbName: 'goalstable-kv',
  native,
  // Read at call time, not at module load: the locale chunk may not have arrived yet when
  // this module is first evaluated.
  onWriteError: () => useUi.getState().showToast(t('toast_write_failed')),
})
