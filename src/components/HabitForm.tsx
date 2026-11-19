import { useState } from 'react'
import { X } from 'lucide-react'
import type { Habit, Weekday } from '../types'
import { WEEKDAY_LABELS } from '../lib/dates'
import type { NewHabitInput } from '../hooks/useHabits'

const COLORS = ['#6b8f71', '#d8a94e', '#c1725b', '#6f8fb0', '#9b7bb0']
const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]

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
  const [identity, setIdentity] = useState(initial?.identity ?? '')
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [activeDays, setActiveDays] = useState<Weekday[]>(initial?.activeDays ?? [])
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime ?? '')
  const [stackAfterHabitId, setStackAfterHabitId] = useState<number | null>(
    initial?.stackAfterHabitId ?? null,
  )

  const toggleDay = (day: Weekday) => {
    setActiveDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name,
      color,
      activeDays,
      reminderTime: reminderTime || null,
      identity: identity.trim() || null,
      stackAfterHabitId,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-t-2xl border border-hairline bg-surface-raised p-6 sm:rounded-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-paper">{initial ? 'Edit habit' : 'New habit'}</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-paper">
            <X size={20} />
          </button>
        </div>

        <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted">Name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Read for 20 minutes"
          className="mb-4 w-full rounded-lg border border-hairline bg-ink px-3 py-2 text-paper placeholder:text-muted focus:border-muted focus:outline-none"
        />

        <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted">
          Identity <span className="normal-case text-muted/70">(optional)</span>
        </label>
        <input
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          placeholder='"I am a reader"'
          className="mb-4 w-full rounded-lg border border-hairline bg-ink px-3 py-2 text-paper placeholder:text-muted focus:border-muted focus:outline-none"
        />

        <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted">Color</label>
        <div className="mb-4 flex gap-2">
          {COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className="h-7 w-7 rounded-full ring-offset-2 ring-offset-surface-raised"
              style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }}
            />
          ))}
        </div>

        <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted">
          Days (empty = every day)
        </label>
        <div className="mb-4 flex gap-1.5">
          {WEEKDAYS.map((day) => (
            <button
              type="button"
              key={day}
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

        {stackableHabits.length > 0 && (
          <>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted">
              Stack after <span className="normal-case text-muted/70">(optional)</span>
            </label>
            <select
              value={stackAfterHabitId ?? ''}
              onChange={(e) => setStackAfterHabitId(e.target.value ? Number(e.target.value) : null)}
              className="mb-4 w-full rounded-lg border border-hairline bg-ink px-3 py-2 text-paper focus:border-muted focus:outline-none"
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

        <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted">
          Reminder (optional)
        </label>
        <input
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
              onClick={() => {
                onDelete()
                onClose()
              }}
              className="rounded-full border border-hairline px-4 py-2.5 text-sm text-rose transition-colors hover:border-rose"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
