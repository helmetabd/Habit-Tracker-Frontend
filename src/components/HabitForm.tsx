import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { Habit, HabitKind, Weekday } from '../types'
import { WEEKDAY_LABELS } from '../lib/dates'
import type { NewHabitInput } from '../hooks/useHabits'

const COLORS = ['#6b8f71', '#d8a94e', '#c1725b', '#6f8fb0', '#9b7bb0']
const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]

const LABEL = 'mb-1 block font-mono text-xs uppercase tracking-wider text-muted'
const INPUT = 'mb-4 w-full rounded-lg border border-hairline bg-ink px-3 py-2 text-paper placeholder:text-muted focus:border-muted focus:outline-none'
const OPTIONAL = <span className="normal-case text-muted/70">(optional)</span>

interface HabitFormProps {
  initial?: Habit
  /** Other habits this one could be stacked after (self is excluded by the caller). */
  stackableHabits: Habit[]
  onSave: (input: NewHabitInput) => void
  onDelete?: () => void
  onClose: () => void
}

export function HabitForm({ initial, stackableHabits, onSave, onDelete, onClose }: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [nameError, setNameError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const [identity, setIdentity] = useState(initial?.identity ?? '')
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [activeDays, setActiveDays] = useState<Weekday[]>(initial?.activeDays ?? [])
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime ?? '')
  const [stackAfterHabitId, setStackAfterHabitId] = useState<number | null>(
    initial?.stackAfterHabitId ?? null,
  )
  const [kind, setKind] = useState<HabitKind>(initial?.kind ?? 'build')
  const [cue, setCue] = useState(initial?.cue ?? '')
  const [replacement, setReplacement] = useState(initial?.replacement ?? '')
  const [consequence, setConsequence] = useState(initial?.consequence ?? '')
  const [witness, setWitness] = useState(initial?.witness ?? '')
  const isBreak = kind === 'break'

  const toggleDay = (day: Weekday) => {
    setActiveDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('Enter a name for this habit.')
      nameRef.current?.focus()
      return
    }
    onSave({
      name,
      color,
      reminderTime: reminderTime || null,
      identity: identity.trim() || null,
      // Break habits are every day and never stacked: they're about avoiding, not scheduling.
      activeDays: isBreak ? [] : activeDays,
      stackAfterHabitId: isBreak ? null : stackAfterHabitId,
      kind,
      cue: isBreak ? cue.trim() || null : null,
      replacement: isBreak ? replacement.trim() || null : null,
      consequence: consequence.trim() || null,
      witness: witness.trim() || null,
    })
    onClose()
  }

  const handleDelete = () => {
    if (!onDelete || !window.confirm(`Delete "${initial?.name}"? Its history will be lost.`)) return
    onDelete()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 sm:items-center">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-t-2xl border border-hairline bg-surface-raised p-6 sm:rounded-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-paper">{initial ? 'Edit habit' : 'New habit'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-paper">
            <X size={20} />
          </button>
        </div>

        <span id="type-label" className={LABEL}>Type</span>
        <div role="group" aria-labelledby="type-label" className="mb-4 flex gap-2">
          {(['build', 'break'] as const).map((k) => (
            <button
              type="button"
              key={k}
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={`flex-1 rounded-full border border-hairline py-1.5 text-sm transition-colors ${
                kind === k ? 'bg-moss text-ink' : 'text-muted hover:text-paper'
              }`}
            >
              {k === 'build' ? 'Build (do it)' : 'Break (avoid it)'}
            </button>
          ))}
        </div>

        <label htmlFor="habit-name" className={LABEL}>Name</label>
        <input
          id="habit-name"
          ref={nameRef}
          autoFocus
          required
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? 'habit-name-error' : undefined}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (nameError) setNameError(null)
          }}
          placeholder="Read for 20 minutes"
          className={INPUT}
        />
        {nameError && (
          <p id="habit-name-error" role="alert" className="-mt-3 mb-4 text-xs text-rose">
            {nameError}
          </p>
        )}

        <label htmlFor="habit-identity" className={LABEL}>Identity {OPTIONAL}</label>
        <input
          id="habit-identity"
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          placeholder='"I am a reader"'
          className={INPUT}
        />

        {isBreak && (
          <>
            <label htmlFor="habit-cue" className={LABEL}>Cue {OPTIONAL}</label>
            <input
              id="habit-cue"
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              placeholder="lying down to sleep"
              className={INPUT}
            />
            <label htmlFor="habit-instead" className={LABEL}>Instead {OPTIONAL}</label>
            <input
              id="habit-instead"
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder="read two pages"
              className={INPUT}
            />
          </>
        )}

        <span id="color-label" className={LABEL}>Color</span>
        <div role="group" aria-labelledby="color-label" className="mb-4 flex gap-2">
          {COLORS.map((c, i) => (
            <button
              type="button"
              key={c}
              aria-label={`Color ${i + 1}`}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
              className="h-7 w-7 rounded-full ring-offset-2 ring-offset-surface-raised"
              style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }}
            />
          ))}
        </div>

        {!isBreak && (
          <>
            <span id="days-label" className={LABEL}>Days (empty = every day)</span>
            <div role="group" aria-labelledby="days-label" className="mb-4 flex gap-1.5">
              {WEEKDAYS.map((day) => (
                <button
                  type="button"
                  key={day}
                  aria-label={WEEKDAY_LABELS[day]}
                  aria-pressed={activeDays.includes(day)}
                  onClick={() => toggleDay(day)}
                  className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs transition-colors"
                  style={{
                    backgroundColor: activeDays.includes(day) ? color : 'var(--color-ink)',
                    color: activeDays.includes(day) ? 'var(--color-ink)' : 'var(--color-muted)',
                    border: '1px solid var(--color-hairline)',
                  }}
                >
                  {WEEKDAY_LABELS[day][0]}
                </button>
              ))}
            </div>
          </>
        )}

        {!isBreak && stackableHabits.length > 0 && (
          <>
            <label htmlFor="habit-stack" className={LABEL}>Stack after {OPTIONAL}</label>
            <select
              id="habit-stack"
              value={stackAfterHabitId ?? ''}
              onChange={(e) => setStackAfterHabitId(e.target.value ? Number(e.target.value) : null)}
              className={INPUT}
            >
              <option value="">— none —</option>
              {stackableHabits.map((h) => (
                <option key={h.id} value={h.id}>
                  After "{h.name}"
                </option>
              ))}
            </select>
          </>
        )}

        <label htmlFor="habit-consequence" className={LABEL}>
          If I miss it, I will… <span className="normal-case text-muted/70">(optional contract)</span>
        </label>
        <input
          id="habit-consequence"
          value={consequence}
          onChange={(e) => setConsequence(e.target.value)}
          placeholder="no phone tonight"
          className={INPUT}
        />

        <label htmlFor="habit-witness" className={LABEL}>Witness {OPTIONAL}</label>
        <input
          id="habit-witness"
          value={witness}
          onChange={(e) => setWitness(e.target.value)}
          placeholder="my sister"
          className={INPUT}
        />

        <label htmlFor="habit-reminder" className={LABEL}>Reminder {OPTIONAL}</label>
        <input
          id="habit-reminder"
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="mb-6 w-full rounded-lg border border-hairline bg-ink px-3 py-2 text-paper focus:border-muted focus:outline-none"
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex-1 rounded-full bg-moss py-2.5 text-sm font-medium text-ink transition-colors hover:bg-moss-dim hover:text-paper"
          >
            {initial ? 'Save changes' : 'Add habit'}
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full border border-hairline px-4 py-2.5 text-sm text-rose transition-colors hover:border-rose"
            >
              Delete habit
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
