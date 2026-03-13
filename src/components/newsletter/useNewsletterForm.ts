import { useState, useCallback, useRef } from 'react'
import { randomErrorMessage } from '../../utils/error-messages'

type Status = 'idle' | 'submitting' | 'success' | 'error'
type Toast = { message: string; variant: 'success' | 'error' } | null

const STORAGE_KEY = 'raw-newsletter'

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

  // Triggers fire animation. isSubscribed is deferred until fire completes (via completeSubscription).
  const setSuccess = useCallback((alreadySubscribed = false) => {
    if (alreadySubscribed) {
      setToast({ message: 'Already subscribed!', variant: 'success' })
    }
    writeStorage()
    setEmail('')
    setStatus('success')
  }, [])

  // Called after fire animation completes to reveal the success message.
  const completeSubscription = useCallback(() => {
    setIsSubscribed(true)
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

  return { email, setEmail, status, toast, submit, clearToast, isSubscribed, reset, abort, completeSubscription }
}
