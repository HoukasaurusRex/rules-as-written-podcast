export const secondsToTimestamp = (s: number): string => {
  const m = 60
  const h = 60 * 60
  const hours = Math.floor(s / h)
  const mins = Math.floor(s / m)
  const secs = Math.floor(s % m)
  return `${hours ? `${hours}:` : ''}${`${mins}:`}${secs < 10 ? `0${secs}` : secs}`
}
