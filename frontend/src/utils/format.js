export function formatDuration(seconds = 0) {
  const safe = Math.max(0, seconds)
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const secs = safe % 60
  if (hours) return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

export function youtubeWatchUrl(videoId, seconds = 0) {
  return `https://www.youtube.com/watch?v=${videoId}&t=${Math.max(0, seconds)}s`
}
