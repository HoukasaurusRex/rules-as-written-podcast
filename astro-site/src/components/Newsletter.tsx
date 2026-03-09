import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setSending(true)
      setToast(null)
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email }),
      })
      if (res.ok) {
        setToast({ message: 'Success! Thanks for subscribing', variant: 'success' })
        setEmail('')
      } else {
        setToast({ message: 'Something went wrong. Please try again.', variant: 'error' })
      }
    } catch {
      setToast({ message: 'Something went wrong. Please try again.', variant: 'error' })
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--space-10)' }}>
      <input
        type="email"
        name="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="janedoe@gmail.com"
        required
        style={{
          display: 'block',
          margin: 'var(--space-3) auto',
          maxWidth: 500,
          width: '100%',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--font-size-2)',
          backgroundColor: 'transparent',
          border: '1px solid var(--color-bg-lighten-20)',
          borderRadius: 'var(--radius-0)',
          color: 'var(--color-text)',
        }}
      />
      <button
        type="submit"
        disabled={sending}
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          height: 60,
          fontWeight: 'bold',
          border: 'none',
          borderRadius: 'var(--radius-0)',
          backgroundImage: 'var(--color-gradient)',
          color: 'var(--color-text)',
          fontSize: 'var(--font-size-2)',
          padding: '0 var(--space-6)',
        }}
      >
        {sending ? 'Sending...' : 'Subscribe'}
      </button>

      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--space-5)',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 500,
            width: '90%',
            display: 'flex',
            alignItems: 'flex-start',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-0)',
            backgroundColor: toast.variant === 'success' ? '#4db98f' : 'hsl(9, 59%, 50%)',
            color: 'var(--color-text)',
            boxShadow: 'var(--color-shadow)',
            zIndex: 100,
          }}
        >
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-4)',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>
      )}
    </form>
  )
}
