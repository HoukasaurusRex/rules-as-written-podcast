import { useState, useEffect, useCallback } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'
type Toast = { message: string; variant: 'success' | 'error' } | null

const STORAGE_KEY = 'raw-newsletter'

function readStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'subscribed'
  } catch {
    return false
  }
}

function writeStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, 'subscribed')
  } catch {
    // private browsing
  }
}

export function useNewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [toast, setToast] = useState<Toast>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    setIsSubscribed(readStorage())
  }, [])

  const clearToast = useCallback(() => setToast(null), [])

  const submit = useCallback(async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('submitting')
    setToast(null)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, source: 'rulesaswrittenshow.com' }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.already_subscribed) {
          setToast({ message: 'Already subscribed!', variant: 'success' })
        }
        writeStorage()
        setIsSubscribed(true)
        setEmail('')
        setStatus('success')
      } else {
        setToast({ message: 'Something went wrong. Please try again.', variant: 'error' })
        setStatus('error')
      }
    } catch {
      setToast({ message: 'Something went wrong. Please try again.', variant: 'error' })
      setStatus('error')
    }
  }, [email])

  const reset = useCallback(() => {
    setStatus('idle')
  }, [])

  return { email, setEmail, status, toast, submit, clearToast, isSubscribed, reset }
}
