import { useState, useEffect } from 'react'
import { Toast } from '../Toast'
import { randomErrorMessage } from '../../utils/error-messages'

interface PartyCreateResult {
  id: string
  name: string
  code: string
}

interface SavedParty {
  id: string
  name: string
  code: string
}

type ToastState = { message: string; variant: 'success' | 'error' } | null

function getSavedParties(): SavedParty[] {
  try {
    return JSON.parse(localStorage.getItem('parties') ?? '[]')
  } catch {
    return []
  }
}

function saveParty(party: SavedParty) {
  const parties = getSavedParties().filter((p) => p.id !== party.id)
  parties.unshift(party)
  localStorage.setItem('parties', JSON.stringify(parties))
}

export default function PartyCreate() {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<PartyCreateResult | null>(null)
  const [toast, setToast] = useState<ToastState>(null)
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [codeSaved, setCodeSaved] = useState(false)
  const [savedParties, setSavedParties] = useState<SavedParty[]>([])
  const [codeInput, setCodeInput] = useState('')

  useEffect(() => {
    setSavedParties(getSavedParties())
  }, [])

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    if (!name.trim() || submitting) return

    setSubmitting(true)
    setToast(null)

    try {
      const res = await fetch('/api/party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status >= 400 && res.status < 500) {
          setToast({ message: data.error ?? 'Invalid request', variant: 'error' })
        } else {
          console.error('Create party error:', data)
          setToast({ message: randomErrorMessage(), variant: 'error' })
        }
        return
      }

      localStorage.setItem(`party-code-${data.id}`, data.code)
      saveParty({ id: data.id, name: data.name, code: data.code })
      setResult(data)
    } catch (err) {
      console.error('Create party error:', err)
      setToast({ message: randomErrorMessage(), variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  async function copyToClipboard(text: string, type: 'code' | 'link') {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (result) {
    const partyUrl = `${window.location.origin}/party/${result.id}`

    return (
      <div className="mx-auto max-w-md px-space-4 pt-space-8 pb-space-14">
        <div className="rounded-[5px] border border-bg-lighter bg-bg-light p-space-6">
          <div className="mb-space-6 text-center">
            <div className="mb-space-2 text-sm uppercase tracking-widest text-primary-muted">
              Party Created
            </div>
            <h2 className="m-0 text-2xl font-bold text-text">{result.name}</h2>
          </div>

          {/* Party Code */}
          <div className="mb-space-6">
            <label className="mb-space-2 block text-xs uppercase tracking-wider text-primary-muted">
              Party Code
            </label>
            <button
              onClick={() => copyToClipboard(result.code, 'code')}
              className="w-full rounded-[5px] border-2 border-dashed border-gold-gp/40 bg-bg px-space-4 py-space-3 text-center font-mono text-xl font-bold tracking-wider text-gold-gp transition-colors hover:border-gold-gp/70 hover:bg-bg-light"
            >
              {result.code}
              <span className="mt-space-1 block text-xs font-normal tracking-normal text-text/50">
                {copied === 'code' ? 'Copied!' : 'Tap to copy'}
              </span>
            </button>
          </div>

          {/* Save code prompt */}
          <div className="mb-space-6 rounded-[5px] border border-gold-gp/20 bg-gold-gp/5 p-space-4">
            <p className="m-0 mb-space-3 text-center text-sm text-text/70">
              Save this code somewhere safe — you'll need it to edit your party.
            </p>
            <label className="flex cursor-pointer items-center justify-center gap-space-2 text-sm text-text/60">
              <input
                type="checkbox"
                checked={codeSaved}
                onChange={(e) => setCodeSaved(e.target.checked)}
                className="accent-primary"
              />
              I've saved the code
            </label>
          </div>

          {/* Share Link */}
          <div className="mb-space-6">
            <label className="mb-space-2 block text-xs uppercase tracking-wider text-primary-muted">
              Share Link
            </label>
            <button
              onClick={() => copyToClipboard(partyUrl, 'link')}
              className="w-full truncate rounded-[5px] border border-bg-lighter bg-bg px-space-4 py-space-3 text-left text-sm text-primary-muted transition-colors hover:bg-bg-light"
            >
              {partyUrl}
              <span className="ml-space-2 text-xs text-text/50">
                {copied === 'link' ? 'Copied!' : 'Tap to copy'}
              </span>
            </button>
          </div>

          <p className="mb-space-6 text-center text-sm leading-relaxed text-text/60">
            Share the <strong className="text-text/80">link</strong> with your party.
            Share the <strong className="text-gold-gp">code</strong> with people who should be able to edit.
          </p>

          {/* Go to party */}
          <a
            href={`/party/${result.id}`}
            className={`block w-full rounded-[5px] px-space-4 py-space-3 text-center font-semibold text-white transition-colors ${
              codeSaved
                ? 'bg-primary hover:bg-primary-light'
                : 'cursor-not-allowed bg-primary/40'
            }`}
            onClick={(e) => { if (!codeSaved) e.preventDefault() }}
          >
            Go to Party Tracker
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-space-4 pt-space-8 pb-space-14">
      <div className="mb-space-6 text-center">
        <h1 className="mb-space-2 text-2xl font-bold text-text">Start a New Party</h1>
        <p className="m-0 text-sm text-text/60">
          Create a party to track gold, inventory, and magic items with your group.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-space-4">
        <div>
          <label htmlFor="party-name" className="mb-space-2 block text-sm font-medium text-text/80">
            Party Name
          </label>
          <input
            id="party-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="The Arcane Adventurers"
            required
            maxLength={100}
            autoFocus
            className="w-full rounded-[5px] border border-bg-lighter bg-bg-light px-space-4 py-space-3 text-base text-text placeholder-text/30 outline-none transition-colors focus:border-primary"
            style={{ fontSize: '16px' }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="w-full rounded-[5px] bg-primary px-space-4 py-space-3 font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Party'}
        </button>
      </form>

      {/* Find party by code */}
      <div className="mt-space-8">
        <h2 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
          Have a party code?
        </h2>
        <div className="flex gap-space-2">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="ARCANE-OWLBEAR-42"
            className="flex-1 rounded-[5px] border border-bg-lighter bg-bg-light px-space-4 py-space-3 font-mono text-sm tracking-wider text-text placeholder-text/30 outline-none focus:border-primary"
            style={{ fontSize: '16px' }}
          />
          <button
            onClick={async () => {
              const code = codeInput.trim()
              if (!code) return
              try {
                const res = await fetch(`/api/party/${encodeURIComponent(code)}`)
                if (res.ok) {
                  const data = await res.json()
                  saveParty({ id: data.id, name: data.name, code })
                  localStorage.setItem(`party-code-${data.id}`, code)
                  window.location.href = `/party/${data.id}`
                } else {
                  setToast({ message: 'Party not found. Check the code and try again.', variant: 'error' })
                }
              } catch {
                setToast({ message: randomErrorMessage(), variant: 'error' })
              }
            }}
            disabled={!codeInput.trim()}
            className="rounded-[5px] bg-primary/20 px-space-4 py-space-3 text-sm font-medium text-primary-muted transition-colors hover:bg-primary/30 disabled:opacity-50"
          >
            Go
          </button>
        </div>
      </div>

      {/* Saved parties */}
      {savedParties.length > 0 && (
        <div className="mt-space-8">
          <h2 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
            Your Parties
          </h2>
          <div className="space-y-space-2">
            {savedParties.map((p) => (
              <div key={p.id} className="flex items-center gap-space-2">
                <a
                  href={`/party/${p.id}`}
                  className="flex flex-1 items-center justify-between rounded-[5px] border border-bg-lighter bg-bg px-space-4 py-space-3 text-left transition-colors hover:bg-bg-light"
                >
                  <div>
                    <div className="text-sm font-medium text-text">{p.name}</div>
                    <div className="font-mono text-xs text-text/40">{p.code}</div>
                  </div>
                  <span className="text-xs text-primary-muted">Open</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const updated = savedParties.filter((s) => s.id !== p.id)
                    localStorage.setItem('parties', JSON.stringify(updated))
                    localStorage.removeItem(`party-code-${p.id}`)
                    setSavedParties(updated)
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] text-text/30 transition-colors hover:bg-error/10 hover:text-error"
                  aria-label={`Remove ${p.name}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
