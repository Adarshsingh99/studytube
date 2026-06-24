import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { Bell, RotateCcw, Save, Youtube } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ProgressBar from '../components/ProgressBar.jsx'
import ReminderModal from '../components/ReminderModal.jsx'
import RoadmapCard from '../components/RoadmapCard.jsx'
import { learningApi, progressApi, reminderApi } from '../services/api.js'
import { formatDuration, youtubeWatchUrl } from '../utils/format.js'

export default function LearningDetails() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [courseQuery, roadmapQuery, progressQuery, reminderQuery] = useQueries({
    queries: [
      { queryKey: ['learning-item', id], queryFn: () => learningApi.get(id) },
      { queryKey: ['roadmap', id], queryFn: () => learningApi.roadmap(id) },
      { queryKey: ['progress', id], queryFn: () => progressApi.get(id) },
      { queryKey: ['reminder', id], queryFn: () => reminderApi.get(id), retry: false },
    ],
  })
  const [watched, setWatched] = useState('')
  const [lastSeconds, setLastSeconds] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  const progress = progressQuery.data
  const course = courseQuery.data
  const roadmap = roadmapQuery.data || []
  const activeVideo = progress?.last_watched_video || course?.videos?.[0]?.youtube_id
  const chartData = useMemo(() => roadmap.slice(0, 7).map((row) => ({ day: `D${row.day_number}`, minutes: row.daily_target_minutes })), [roadmap])

  const updateProgress = useMutation({
    mutationFn: (payload) => progressApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const recalculate = useMutation({
    mutationFn: () => progressApi.recalculate(id, Math.max(1, course.target_days - 3)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roadmap', id] }),
  })

  const saveReminder = useMutation({
    mutationFn: (payload) => reminderApi.upsert(id, payload),
    onSuccess: () => {
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['reminder', id] })
    },
  })

  if (courseQuery.isLoading) {
    return <div className="rounded-lg bg-white p-8 text-slate-500 dark:bg-slate-900 dark:text-slate-400">Loading course...</div>
  }

  if (!course) {
    return <div className="rounded-lg bg-white p-8 text-red-500 dark:bg-slate-900">Course not found.</div>
  }

  const completedMinutes = Number(watched || progress?.completed_minutes || 0)
  const lastTimestamp = Number(lastSeconds || progress?.last_watched_timestamp || 0)

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg bg-white shadow-soft dark:bg-slate-900">
        <div className="grid lg:grid-cols-[360px_1fr]">
          <img className="h-64 w-full object-cover lg:h-full" src={course.thumbnail || 'https://placehold.co/640x360?text=StudyTube'} alt="" />
          <div className="p-5 sm:p-6">
            <p className="text-sm font-bold uppercase text-coral">{course.type}</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950 dark:text-white">{course.title}</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{course.channel_name} | {formatDuration(course.total_duration)} | {course.target_days} days</p>
            <div className="mt-6 max-w-xl"><ProgressBar value={progress?.completion_percentage || 0} label="Completion" /></div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="focus-ring inline-flex items-center gap-2 rounded-md bg-coral px-4 py-3 font-bold text-white hover:bg-[#ef5146]" href={youtubeWatchUrl(activeVideo, progress?.last_watched_timestamp || 0)} target="_blank" rel="noreferrer">
                <Youtube size={18} /> Continue watching
              </a>
              <button className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-3 font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => setModalOpen(true)}>
                <Bell size={18} /> Reminder {reminderQuery.data?.reminder_time ? reminderQuery.data.reminder_time : ''}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-slate-900">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Update progress</h2>
            <label className="mt-4 block text-sm font-semibold text-slate-600 dark:text-slate-300">
              Completed minutes
              <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950" type="number" min="0" value={watched} placeholder={String(progress?.completed_minutes || 0)} onChange={(event) => setWatched(event.target.value)} />
            </label>
            <label className="mt-4 block text-sm font-semibold text-slate-600 dark:text-slate-300">
              Last watched timestamp in seconds
              <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950" type="number" min="0" value={lastSeconds || ''} placeholder={String(progress?.last_watched_timestamp || 0)} onChange={(event) => setLastSeconds(event.target.value)} />
            </label>
            <button className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 font-bold text-white hover:bg-coral dark:bg-white dark:text-slate-950" onClick={() => updateProgress.mutate({ completed_minutes: completedMinutes, last_watched_timestamp: lastTimestamp, last_watched_video: activeVideo, mark_day_complete: true })}>
              <Save size={18} /> Mark daily goal complete
            </button>
            <button className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-3 font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => recalculate.mutate()}>
              <RotateCcw size={18} /> Recalculate after missed days
            </button>
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-slate-900">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Weekly target</h2>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#ff6b5f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-black text-slate-950 dark:text-white">Roadmap</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {roadmap.map((row) => <RoadmapCard key={row.id} row={row} activeVideo={activeVideo} />)}
          </div>
        </div>
      </section>

      <ReminderModal open={modalOpen} initialTime={reminderQuery.data?.reminder_time || '08:00'} saving={saveReminder.isPending} onClose={() => setModalOpen(false)} onSave={(payload) => saveReminder.mutate(payload)} />
    </div>
  )
}
