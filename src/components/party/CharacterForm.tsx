import { useState, type FormEvent } from 'react'

interface Props {
  onSubmit: (name: string, charClass?: string, level?: number) => Promise<void>
  onClose: () => void
  initial?: { name: string; class?: string | null; level?: number }
  title?: string
}

const DND_CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
  'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard',
  'Artificer', 'Blood Hunter',
]

export default function CharacterForm({ onSubmit, onClose, initial, title = 'Add Character' }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [charClass, setCharClass] = useState(initial?.class ?? '')
  const [level, setLevel] = useState<number | ''>(initial?.level ?? 1)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || submitting) return
    setSubmitting(true)
    await onSubmit(name.trim(), charClass || undefined, level || 1)
    setSubmitting(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-space-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg-light p-space-6 shadow-lg">
        <h3 className="m-0 mb-space-4 text-lg font-bold text-text">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-space-4">
          <div>
            <label htmlFor="char-name" className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">
              Name
            </label>
            <input
              id="char-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Thorin Oakenshield"
              required
              maxLength={60}
              autoFocus
              className="w-full rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg px-space-4 py-space-3 text-base text-text placeholder-text/30 outline-none focus:border-primary"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div>
            <label htmlFor="char-class" className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">
              Class
            </label>
            <select
              id="char-class"
              value={charClass}
              onChange={(e) => setCharClass(e.target.value)}
              className="w-full rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg px-space-4 py-space-3 text-base text-text outline-none focus:border-primary"
              style={{ fontSize: '16px' }}
            >
              <option value="">Select a class...</option>
              {DND_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="char-level" className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">
              Level
            </label>
            <input
              id="char-level"
              type="number"
              min={1}
              max={20}
              value={level}
              onChange={(e) => {
                const v = e.target.value
                setLevel(v === '' ? '' : Math.min(20, Math.max(0, parseInt(v) || 0)))
              }}
              onBlur={() => {
                if (level === '' || level < 1) setLevel(1)
                if (typeof level === 'number' && level > 20) setLevel(20)
              }}
              inputMode="numeric"
              className={`w-full rounded-[5px] border bg-bg px-space-4 py-space-3 text-base text-text outline-none ${
                typeof level === 'number' && (level < 1 || level > 20) ? 'border-red-500/50' : 'border-bg-lighter'
              } focus:border-primary`}
              style={{ fontSize: '16px' }}
            />
          </div>

          <div className="flex gap-space-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg px-space-4 py-space-3 text-sm text-text/60 transition-colors hover:bg-bg-light"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 rounded-[5px] bg-primary px-space-4 py-space-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
            >
              {submitting ? 'Saving...' : initial ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
