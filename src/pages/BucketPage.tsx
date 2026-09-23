import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AddGoalFab } from '../components/AddGoal'
import { GoalList } from '../components/GoalList'
import { EmptyState, ProgressRing } from '../components/ui'
import { BACKLOG, type Bucket } from '../lib/types'
import { bucketLabel, bucketsOf, goalsIn, statsFor, useGoals } from '../store/goals'
import { useT } from '../store/lang'

/** One year — or the backlog — in full. Reached from the archive. */
export default function BucketPage() {
  const { bucket: raw } = useParams<{ bucket: string }>()
  const goals = useGoals((s) => s.goals)
  const t = useT()

  const bucket: Bucket = raw === BACKLOG ? BACKLOG : Number(raw)
  const valid = bucket === BACKLOG || Number.isFinite(bucket)

  const buckets = useMemo(() => bucketsOf(goals), [goals])
  const items = useMemo(() => (valid ? goalsIn(goals, bucket) : []), [goals, bucket, valid])
  const stats = statsFor(items)

  if (!valid) {
    return (
      <main className="page">
        <EmptyState title={t('bucket_unknown')} hint={t('bucket_unknown_hint')} />
      </main>
    )
  }

  const label = bucketLabel(bucket, t('backlog'))
  const open = stats.total - stats.done

  return (
    <main className="page">
      <header className="page-head">
        <Link to="/archive" className="back">
          ← {t('archive_title')}
        </Link>
        <h1>{label}</h1>
      </header>

      <section className="card year-summary">
        <ProgressRing ratio={stats.ratio} sub={`${stats.done}/${stats.total}`} />
        <p className="year-blurb">
          {bucket === BACKLOG
            ? t('bucket_backlog_blurb')
            : stats.ratio === 1
              ? t('bucket_all_met')
              : t('bucket_left_open', { n: open })}
        </p>
      </section>

      {items.length ? (
        <GoalList goals={items} buckets={buckets} />
      ) : (
        <EmptyState title={t('bucket_empty')} hint={t('bucket_empty_hint')} />
      )}

      <AddGoalFab defaultBucket={bucket} buckets={buckets} />
    </main>
  )
}
