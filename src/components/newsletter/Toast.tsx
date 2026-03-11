import { useEffect } from 'react'

interface ToastProps {
  message: string
  variant: 'success' | 'error'
  onClose: () => void
  autoClose?: number
}

export function Toast({ message, variant, onClose, autoClose = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, autoClose)
    return () => clearTimeout(timer)
  }, [onClose, autoClose])

  return (
    <div
      className={`newsletter-toast newsletter-toast--${variant}`}
      role="status"
      aria-live="polite"
    >
      <div className="newsletter-toast__content">
        <span className="newsletter-toast__message">{message}</span>
        <button
          onClick={onClose}
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
