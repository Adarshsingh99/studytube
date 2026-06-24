import { Bell, X } from 'lucide-react'
import { useState } from 'react'

const presets = ['08:00', '13:00', '20:00']

export default function ReminderModal({ open, initialTime = '08:00', onClose, onSave, saving }) {
  const [time, setTime] = useState(initialTime)
  const [enabled, setEnabled] = useState(true)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-soft dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950 dark:text-white"><Bell size={20} /> Reminder</h2>
          <button className="focus-ring rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose} aria-label="Close reminder modal">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {presets.map((preset) => (
            <button key={preset} className={`focus-ring rounded-md border px-3 py-2 text-sm font-semibold ${time === preset ? 'border-coral bg-coral text-white' : 'border-slate-200 dark:border-slate-700'}`} onClick={() => setTime(preset)}>
              {preset}
            </button>
          ))}
        </div>
        <label className="mt-4 block text-sm font-medium text-slate-600 dark:text-slate-300">
          Custom time
          <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
        </label>
        <label className="mt-4 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          Enable daily notification
        </label>
        <button className="focus-ring mt-6 w-full rounded-md bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-coral disabled:opacity-60 dark:bg-white dark:text-slate-950" disabled={saving} onClick={() => onSave({ reminder_time: time, notification_enabled: enabled })}>
          Save reminder
        </button>
      </div>
    </div>
  )
}
