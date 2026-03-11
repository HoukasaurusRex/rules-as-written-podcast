import { useState, useEffect, useRef, useCallback } from 'react'

const MESSAGES = [
  'Bear with me here',
  'The postmaster is sleeping, give her some time to wake up',
  "We don't pay her very much so I'll give her a couple seconds",
  "Let me knock on the door to see if she's awake",
  "You know what, I got your message - I'll try delivering it to her myself when she's up",
]

const INITIAL_DELAY = 3000
const MESSAGE_INTERVAL = 6000
const EXIT_DURATION = 200

export type MessagePhase = 'entering' | 'visible' | 'exiting' | null

export function useSlowLoadingMessages(isSubmitting: boolean) {
  const [messageIndex, setMessageIndex] = useState(-1)
  const [phase, setPhase] = useState<MessagePhase>(null)
  const [shouldAbort, setShouldAbort] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t)
    timersRef.current = []
  }, [])

  const resetState = useCallback(() => {
    clearTimers()
    setMessageIndex(-1)
    setPhase(null)
    setShouldAbort(false)
  }, [clearTimers])

  useEffect(() => {
    if (!isSubmitting) {
      resetState()
      return
    }

    const schedule = (fn: () => void, ms: number) => {
      timersRef.current.push(setTimeout(fn, ms))
    }

    const enterMessage = (index: number) => {
      setMessageIndex(index)
      setPhase('entering')
      schedule(() => setPhase('visible'), 300)
    }

    const showMessage = (index: number) => {
      if (index > 0) {
        setPhase('exiting')
        schedule(() => enterMessage(index), EXIT_DURATION)
      } else {
        enterMessage(index)
      }
    }

    schedule(() => showMessage(0), INITIAL_DELAY)
    for (let i = 1; i < MESSAGES.length; i++) {
      schedule(() => showMessage(i), INITIAL_DELAY + i * MESSAGE_INTERVAL)
    }

    // Abort after all messages exhaust
    schedule(() => {
      setPhase('exiting')
      schedule(() => {
        setShouldAbort(true)
        resetState()
      }, EXIT_DURATION)
    }, INITIAL_DELAY + MESSAGES.length * MESSAGE_INTERVAL)

    return clearTimers
  }, [isSubmitting, clearTimers, resetState])

  const message = messageIndex >= 0 && messageIndex < MESSAGES.length
    ? MESSAGES[messageIndex]
    : null

  return { message, phase, shouldAbort }
}
