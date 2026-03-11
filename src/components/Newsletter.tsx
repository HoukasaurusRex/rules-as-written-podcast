import { useEffect } from 'react'
import { useNewsletterForm } from './newsletter/useNewsletterForm'
import { useTypewriter } from './newsletter/useTypewriter'
import { useFireEffect } from './newsletter/useFireEffect'
import { useSlowLoadingMessages } from './newsletter/useSlowLoadingMessages'
import { Toast } from './newsletter/Toast'
import './newsletter/newsletter.css'

export default function Newsletter() {
  const { email, setEmail, status, toast, submit, clearToast, isSubscribed, reset, abort, completeSubscription } = useNewsletterForm()

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
          <form onSubmit={submit}>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="janedoe@gmail.com"
              required
              autoComplete="email"
              className="newsletter-input"
            />
            <button
              type="submit"
              disabled={isSubmitting || fireTriggered}
              className="newsletter-button"
            >
              {buttonText}
              {showCursor && <span className="newsletter-cursor">|</span>}
            </button>

            <div className="newsletter-subtext-container">
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
