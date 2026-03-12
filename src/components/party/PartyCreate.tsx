import { useState } from 'react'

interface PartyCreateResult {
  id: string
  name: string
  code: string
}

export default function PartyCreate() {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<PartyCreateResult | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || submitting) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create party')

      // Store code in localStorage for immediate edit access
      localStorage.setItem(`party-code-${data.id}`, data.code)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
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
        <div className="rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg-light p-space-6">
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

          {/* Share Link */}
          <div className="mb-space-6">
            <label className="mb-space-2 block text-xs uppercase tracking-wider text-primary-muted">
              Share Link
            </label>
            <button
              onClick={() => copyToClipboard(partyUrl, 'link')}
              className="w-full truncate rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg px-space-4 py-space-3 text-left text-sm text-primary-muted transition-colors hover:bg-bg-light"
            >
              {partyUrl}
              <span className="ml-space-2 text-xs text-text/50">
                {copied === 'link' ? 'Copied!' : 'Tap to copy'}
              </span>
            </button>
          </div>

          {/* Instructions */}
          <p className="mb-space-6 text-center text-sm leading-relaxed text-text/60">
            Share the <strong className="text-text/80">link</strong> with your party.
            Share the <strong className="text-gold-gp">code</strong> with people who should be able to edit.
          </p>

          {/* Go to party */}
          <a
            href={`/party/${result.id}`}
            className="block w-full rounded-[5px] bg-primary px-space-4 py-space-3 text-center font-semibold text-white transition-colors hover:bg-primary-light"
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
        <h1 className="mb-space-2 text-3xl font-bold text-text">Start a New Party</h1>
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
            className="w-full rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg-light px-space-4 py-space-3 text-base text-text placeholder-text/30 outline-none transition-colors focus:border-primary"
            style={{ fontSize: '16px' }} // Prevent iOS zoom
          />
        </div>

        {error && (
          <div className="rounded-[5px] border border-red-500/30 bg-red-500/10 px-space-4 py-space-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="w-full rounded-[5px] bg-primary px-space-4 py-space-3 font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Party'}
        </button>
      </form>
    </div>
  )
}
