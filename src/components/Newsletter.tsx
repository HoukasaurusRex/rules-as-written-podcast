import { useEffect, useRef, useState } from 'react'
import { useNewsletterForm } from './newsletter/useNewsletterForm'
import { useTypewriter } from './newsletter/useTypewriter'
import { useFireEffect } from './newsletter/useFireEffect'
import { useSlowLoadingMessages } from './newsletter/useSlowLoadingMessages'
import { Toast } from './newsletter/Toast'
import './newsletter/newsletter.css'

export default function Newsletter() {
  const { email, setEmail, status, toast, submit, clearToast, isSubscribed, reset, abort, completeSubscription } = useNewsletterForm()

  const inputRef = useRef<HTMLInputElement>(null)
  const [isValid, setIsValid] = useState(false)

  const isSubmitting = status === 'submitting'
  const fireTriggered = status === 'success'
  const { text: buttonText, showCursor } = useTypewriter(isSubmitting)
  const { phase, isActive: fireActive, FireOverlay } = useFireEffect(fireTriggered, completeSubscription)
  const { message: loadingMessage, phase: loadingPhase, shouldAbort } = useSlowLoadingMessages(isSubmitting)

  useEffect(() => {
    if (shouldAbort) abort()
  }, [shouldAbort, abort])

  const showSuccess = isSubscribed && !fireActive

  const wrapperClass = [
    'newsletter-wrapper',
    showSuccess ? 'newsletter-wrapper--subscribed'
      : phase === 1 ? 'newsletter-wrapper--warmup'
      : !fireActive ? 'newsletter-wrapper--visible'
      : '',
    isSubmitting ? 'newsletter-wrapper--submitting' : '',
    phase === 2 ? 'newsletter-wrapper--burning' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClass}>
      <div className="newsletter-content">
        {showSuccess ? (
          <div className="newsletter-success newsletter-success--revealed">
            <h3>You're in the party!</h3>
            <p>Watch your inbox for the next quest log.</p>
          </div>
        ) : (
          <form onSubmit={submit} aria-label="Newsletter signup">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              ref={inputRef}
              id="newsletter-email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setIsValid(e.target.validity.valid)
              }}
              placeholder="brunhilda.rockskull@hotmail.com"
              required
              autoComplete="email"
              aria-describedby="newsletter-status"
              aria-invalid={email.length > 0 && !isValid ? true : undefined}
              className="newsletter-input"
            />
            <button
              type="submit"
              disabled={isSubmitting || fireTriggered || !isValid}
              className="newsletter-button"
            >
              {buttonText}
              {showCursor && <span className="newsletter-cursor" aria-hidden="true">|</span>}
            </button>

            <div className="newsletter-subtext-container" id="newsletter-status" aria-live="polite">
              {loadingMessage && loadingPhase && (
                <div className={`newsletter-subtext newsletter-subtext--${loadingPhase}`}>
                  {loadingMessage}
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      {FireOverlay}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => {
            clearToast()
            if (status === 'error') reset()
          }}
        />
      )}
    </div>
  )
}
