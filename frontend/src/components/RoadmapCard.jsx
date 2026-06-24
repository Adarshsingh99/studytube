import { CheckCircle2, Clock3, PlayCircle } from 'lucide-react'
import { formatDuration, youtubeWatchUrl } from '../utils/format.js'

export default function RoadmapCard({ row, activeVideo }) {
  const isCurrent = row.start_video === activeVideo

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-coral">Day {row.day_number}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">
            {formatDuration(row.start_timestamp)} to {formatDuration(row.end_timestamp)}
          </h3>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock3 size={16} /> {row.daily_target_minutes} minutes
          </p>
        </div>
        {isCurrent ? <CheckCircle2 className="text-mint" size={22} /> : <PlayCircle className="text-slate-400" size={22} />}
      </div>
      <a className="mt-4 inline-flex items-center rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-coral dark:bg-white dark:text-slate-950" href={youtubeWatchUrl(row.start_video, row.start_timestamp)} target="_blank" rel="noreferrer">
        Continue
      </a>
    </article>
  )
}
