import { useState, useEffect, useRef } from 'react'

const PHASES = [
  // Delete "e" from "Subscribe"
  { text: 'Subscrib', delay: 150 },
  // Retype "ing"
  { text: 'Subscribi', delay: 150 },
  { text: 'Subscribin', delay: 150 },
  { text: 'Subscribing', delay: 150 },
  // Dots phase
  { text: 'Subscribing.', delay: 400 },
  { text: 'Subscribing..', delay: 400 },
  { text: 'Subscribing...', delay: 400 },
  // Loop back to dots
  { text: 'Subscribing', delay: 400 },
] as const

export function useTypewriter(enabled: boolean): { text: string; showCursor: boolean } {
  const [index, setIndex] = useState(-1)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const reducedMotion = useRef(false)

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (!enabled) {
      setIndex(-1)
      return
    }

    if (reducedMotion.current) {
      setIndex(-2) // sentinel for static fallback
      return
    }

    setIndex(0)
  }, [enabled])

  useEffect(() => {
    if (index < 0) return

    const dotsStart = 4 // index where dots phase begins
    const nextIndex = index >= PHASES.length - 1 ? dotsStart : index + 1

    timerRef.current = setTimeout(() => {
      setIndex(nextIndex)
    }, PHASES[index].delay)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [index])

  if (!enabled) return { text: 'Subscribe', showCursor: false }
  if (index === -2) return { text: 'Sending...', showCursor: false }
  if (index < 0) return { text: 'Subscribe', showCursor: false }

  const inTypingPhase = index < 4 // before dots
  return { text: PHASES[index].text, showCursor: inTypingPhase }
}
