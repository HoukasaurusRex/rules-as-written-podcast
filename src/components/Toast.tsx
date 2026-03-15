import { useEffect, useState, useCallback } from 'react'
import './newsletter/newsletter.css'

interface ToastProps {
  message: string
  variant: 'success' | 'error'
  onClose: () => void
  autoClose?: number
}

export function Toast({ message, variant, onClose, autoClose = 8000 }: ToastProps) {
  const [exiting, setExiting] = useState(false)

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(onClose, 300)
  }, [onClose])

  useEffect(() => {
    const timer = setTimeout(dismiss, autoClose)
    return () => clearTimeout(timer)
  }, [dismiss, autoClose])

  return (
    <div
      className={`newsletter-toast newsletter-toast--${variant}${exiting ? ' newsletter-toast--exiting' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="newsletter-toast__content">
        <span className="newsletter-toast__message">{message}</span>
        <button
          onClick={dismiss}
          className="newsletter-toast__close"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
      <div
        className="newsletter-toast__progress"
        style={{ animationDuration: `${autoClose}ms` }}
      />
    </div>
  )
}
