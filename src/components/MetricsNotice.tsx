import { dismissMetricsNotice, useMetrics } from '../lib/metrics'
import { useT } from '../store/lang'

/**
 * The one-time line saying that usage counts are sent, and where to turn them off.
 *
 * On Today because that is where the app opens. It never blocks anything: it stays above
 * the day until dismissed here or until the switch in Profile is touched.
 */
export function MetricsNotice() {
  const { notice } = useMetrics()
  const t = useT()
  if (!notice) return null
  return (
    <div className="metrics-notice" role="status">
      <p>{t('metrics_notice')}</p>
      <button type="button" className="btn" onClick={dismissMetricsNotice}>
        {t('common_ok')}
      </button>
    </div>
  )
}
