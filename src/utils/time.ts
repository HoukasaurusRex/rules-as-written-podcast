export const secondsToTimestamp = (seconds?: number | string): string => {
  const s = Number(seconds)
  if (!s) return '00:00' 
  const m = 60
  const h = 60 * 60
  const hours = Math.floor(s / h)
  const mins = Math.floor(s / m)
  const secs = Math.floor(s % m)
  return `${hours ? `${hours}:` : ''}${`${mins}:`}${secs < 10 ? `0${secs}` : secs}`
}
