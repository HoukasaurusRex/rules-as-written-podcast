import { useState } from 'react'
import { useEditMode } from './hooks/useEditMode'

interface Props {
  partyId: string
}

export default function PartyCodeGate({ partyId }: Props) {
  const { editMode, validateCode } = useEditMode(partyId)
  const [showModal, setShowModal] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (editMode) return null

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    if (!code.trim() || submitting) return

    setSubmitting(true)
    setError('')

    const valid = await validateCode(code.trim())
    if (!valid) setError('Invalid code. Check the format and try again.')
    else setShowModal(false)

    setSubmitting(false)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-space-2 rounded-[5px] border border-gold-gp/30 bg-gold-gp/10 px-space-4 py-space-2 text-sm font-medium text-gold-gp transition-colors hover:bg-gold-gp/20"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Unlock Editing
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-space-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="w-full max-w-sm rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg-light p-space-6 shadow-lg">
            <h3 className="m-0 mb-space-4 text-lg font-bold text-text">
              Enter Party Code
            </h3>

            <form onSubmit={handleSubmit} className="space-y-space-4">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ARCANE-OWLBEAR-42"
                  autoFocus
                  autoComplete="off"
                  className="w-full rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg px-space-4 py-space-3 font-mono text-base tracking-wider text-text placeholder-text/30 outline-none transition-colors focus:border-primary"
                  style={{ fontSize: '16px' }}
                />
                <p className="m-0 mt-space-2 text-xs text-text/40">
                  Format: WORD-CREATURE-NUMBER
                </p>
              </div>

              {error && (
                <div className="rounded-[5px] border border-error/30 bg-error/10 px-space-3 py-space-2 text-sm text-error">
                  {error}
                </div>
              )}

              <div className="flex gap-space-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg px-space-4 py-space-3 text-sm text-text/60 transition-colors hover:bg-bg-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !code.trim()}
                  className="flex-1 rounded-[5px] bg-primary px-space-4 py-space-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
                >
                  {submitting ? 'Checking...' : 'Unlock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
