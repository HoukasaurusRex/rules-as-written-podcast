import { useState, useCallback, useRef } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'
type Toast = { message: string; variant: 'success' | 'error' } | null

const STORAGE_KEY = 'raw-newsletter'

const ERROR_MESSAGES = [
  "Damn elves hexed the mail scroll. Let me wipe it off and try again.",
  "Looks like a fey ran off with your message. So it goes. Try again more quietly.",
  "Hmm that didn't work. Let me hit it with the fixing stick and try again.",
  "Looks like a wild surge flipped a bit. These things happen. Try again with less magic.",
  "Oh no the carrier pidgeon got distracted. Mating season, what can you do. Try with magic instead.",
  "Nat 1... *go on and roll again, I won't tell anyone*",
  "Sprites got into the works again. Let me get the fixing stick...",
  "Postmaster's on break. again... Maybe ask again politely with nice, free words?",
]

function randomErrorMessage(): string {
  return ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]
}

function readStorage(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === 'subscribed' }
  catch { return false }
}

function writeStorage() {
  try { localStorage.setItem(STORAGE_KEY, 'subscribed') }
  catch { /* private browsing */ }
}

export function useNewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [toast, setToast] = useState<Toast>(null)
  const [isSubscribed, setIsSubscribed] = useState(() => readStorage())
  const abortRef = useRef<AbortController | null>(null)

  const clearToast = useCallback(() => setToast(null), [])

  const setError = useCallback(() => {
    setToast({ message: randomErrorMessage(), variant: 'error' })
    setStatus('error')
  }, [])

  const setSuccess = useCallback((alreadySubscribed = false) => {
    if (alreadySubscribed) {
      setToast({ message: 'Already subscribed!', variant: 'success' })
    }
    writeStorage()
    setIsSubscribed(true)
    setEmail('')
    setStatus('success')
  }, [])

  const abort = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setError()
  }, [setError])

  const submit = useCallback(async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('submitting')
    setToast(null)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, source: 'rulesaswrittenshow.com' }),
        signal: controller.signal,
      })

      if (res.ok) {
        const data = await res.json()
        setSuccess(data.already_subscribed)
      } else {
        setError()
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError()
    } finally {
      abortRef.current = null
    }
  }, [email, setSuccess, setError])

  const reset = useCallback(() => setStatus('idle'), [])

  return { email, setEmail, status, toast, submit, clearToast, isSubscribed, reset, abort }
}
