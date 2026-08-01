export function formatCountdown(targetIso, now) {
  const remainingMs = new Date(targetIso).getTime() - now
  if (remainingMs <= 0) return { label: '00:00', isDue: true }
  const totalSeconds = Math.floor(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const label = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  return { label, isDue: false }
}
