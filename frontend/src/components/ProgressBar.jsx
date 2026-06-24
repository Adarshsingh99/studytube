export default function ProgressBar({ value = 0, label }) {
  const safeValue = Math.min(100, Math.max(0, value))
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-coral to-mint transition-all duration-500" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  )
}
