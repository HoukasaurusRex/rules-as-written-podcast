import { useRef, useMemo } from 'react'
import { useNewsletterForm } from './newsletter/useNewsletterForm'
import { useTypewriter } from './newsletter/useTypewriter'
import { useFireEffect } from './newsletter/useFireEffect'
import { Toast } from './newsletter/Toast'
import './newsletter/newsletter.css'

export default function Newsletter() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { email, setEmail, status, toast, submit, clearToast, isSubscribed, reset } = useNewsletterForm()

  const isSubmitting = status === 'submitting'
  const fireTriggered = status === 'success'
  const { text: buttonText, showCursor } = useTypewriter(isSubmitting)
  const { phase, isActive: fireActive } = useFireEffect(wrapperRef, fireTriggered)

  // After fire completes (phase becomes null) or reduced motion skips fire
  const showSuccess = isSubscribed && !fireActive

  const wrapperClass = useMemo(() => {
    const classes = ['newsletter-wrapper']
    if (showSuccess) {
      classes.push('newsletter-wrapper--subscribed')
    } else if (phase === 1) {
      classes.push('newsletter-wrapper--warmup')
    } else if (!fireActive) {
      classes.push('newsletter-wrapper--visible')
    }
    return classes.join(' ')
  }, [showSuccess, phase, fireActive])

  // Show overlay during fire engulf phase
  const showOverlay = phase === 3

  return (
    <div ref={wrapperRef} className={wrapperClass}>
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
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="janedoe@gmail.com"
            required
            className="newsletter-input"
          />
          <button
            type="submit"
            disabled={isSubmitting || fireTriggered}
            className="newsletter-button"
          >
            {isSubmitting ? (
              <>
                {buttonText}
                {showCursor && <span style={{ animation: 'blink 0.8s step-end infinite' }}>|</span>}
              </>
            ) : isSubscribed ? (
              'Subscribe... again?'
            ) : (
              'Subscribe'
            )}
          </button>
        </form>
      )}

      {/* Dark overlay during fire engulf */}
      <div className={`newsletter-overlay${showOverlay ? ' newsletter-overlay--active' : ''}`} />

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
