import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Activity, BookOpen, CheckCircle2, Clock3, Flame, Plus, Target } from 'lucide-react'
import { useState } from 'react'
import ProgressBar from '../components/ProgressBar.jsx'
import { getApiErrorMessage, learningApi } from '../services/api.js'
import { formatDuration } from '../utils/format.js'

const goalOptions = [7, 15, 30]

export default function Dashboard() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ url: '', target_days: 15, reminder_time: '08:00' })
  const stats = useQuery({ queryKey: ['dashboard'], queryFn: learningApi.dashboard })
  const courses = useQuery({ queryKey: ['learning-items'], queryFn: learningApi.list })
  const create = useMutation({
    mutationFn: learningApi.create,
    onSuccess: () => {
      setForm({ url: '', target_days: 15, reminder_time: '08:00' })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['learning-items'] })
    },
  })

  const stat = stats.data || {}
  const cards = [
    ['Total Courses', stat.total_courses || 0, BookOpen],
    ['Active', stat.active_courses || 0, Activity],
    ['Completed', stat.completed_courses || 0, CheckCircle2],
    ['Study Minutes', stat.total_study_time || 0, Clock3],
    ['Current Streak', stat.current_streak || 0, Flame],
    ['Avg Completion', `${stat.completion_percentage || 0}%`, Target],
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="glass rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
              <Icon size={20} className="text-coral" />
            </div>
            <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form className="glass rounded-lg p-5 shadow-soft" onSubmit={(event) => { event.preventDefault(); create.mutate(form) }}>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">Add learning item</h1>
          <label className="mt-5 block text-sm font-semibold text-slate-600 dark:text-slate-300">
            YouTube video or playlist URL
            <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950" placeholder="https://youtube.com/watch?v=..." value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} required />
          </label>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {goalOptions.map((days) => (
              <button type="button" key={days} className={`focus-ring rounded-md border px-3 py-2 text-sm font-bold ${form.target_days === days ? 'border-coral bg-coral text-white' : 'border-slate-200 dark:border-slate-700'}`} onClick={() => setForm({ ...form, target_days: days })}>{days} days</button>
            ))}
          </div>
          <label className="mt-4 block text-sm font-semibold text-slate-600 dark:text-slate-300">
            Custom days
            <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950" type="number" min="1" max="365" value={form.target_days} onChange={(event) => setForm({ ...form, target_days: Number(event.target.value) })} />
          </label>
          <label className="mt-4 block text-sm font-semibold text-slate-600 dark:text-slate-300">
            Reminder
            <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950" type="time" value={form.reminder_time} onChange={(event) => setForm({ ...form, reminder_time: event.target.value })} />
          </label>
          {create.error && <p className="mt-4 text-sm text-red-500">{getApiErrorMessage(create.error, 'Could not add item')}</p>}
          <button className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 font-bold text-white hover:bg-coral disabled:opacity-60 dark:bg-white dark:text-slate-950" disabled={create.isPending}>
            <Plus size={18} /> Generate roadmap
          </button>
        </form>

        <div className="space-y-4">
          {(courses.data || []).map((course) => (
            <Link key={course.id} to={`/learning/${course.id}`} className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="flex gap-4">
                <img className="h-24 w-36 rounded-md object-cover" src={course.thumbnail || 'https://placehold.co/480x270?text=StudyTube'} alt="" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-black text-slate-950 dark:text-white">{course.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course.channel_name} | {formatDuration(course.total_duration)} | {course.target_days} days</p>
                  <div className="mt-4"><ProgressBar value={course.progress?.completion_percentage || (course.status === 'completed' ? 100 : 0)} label={course.status} /></div>
                </div>
              </div>
            </Link>
          ))}
          {!courses.isLoading && !courses.data?.length && (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">Add a YouTube course to generate your first roadmap.</div>
          )}
        </div>
      </section>
    </div>
  )
}
