import { Check, Flame, Plus } from 'lucide-react'
import type { CompletionLog, Habit } from '../types'
import { isScheduledOn, todayKey } from '../lib/dates'
import { calculateStreak, missedYesterday } from '../lib/streaks'
import { owedPenaltyDates } from '../lib/debt'

interface TodayListProps {
  habits: Habit[]
  log: CompletionLog
  onToggle: (habitId: number) => void
  /** Log yesterday's completion for a habit that was missed (pays the debt). */
  onRepay: (habitId: number) => void
  /** Mark a contract penalty for a given day as paid (or undo it). */
  onPayPenalty: (habitId: number, dateKey: string) => void
  onAddHabit: () => void
}

export function TodayList({ habits, log, onToggle, onRepay, onPayPenalty, onAddHabit }: TodayListProps) {
  const today = new Date()
  const key = todayKey()
  const scheduled = habits.filter((h) => isScheduledOn(h, today))
  const doneToday = log[key] ?? []
  const owed = habits.filter((h) => h.kind === 'build' && missedYesterday(h, log, today))
  const penalties = habits.flatMap((h) => owedPenaltyDates(h, log, today).map((date) => ({ habit: h, date })))
  const penaltySection = penalties.length > 0 && (
    <section className="px-5 pt-4 sm:px-8">
      <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-rose">You owe</h3>
      <ul className="flex flex-col gap-2">
        {penalties.map(({ habit, date }) => (
          <li
            key={`${habit.id}:${date}`}
            className="flex flex-col gap-2 rounded-xl border border-rose px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-body text-sm text-paper">
              {habit.consequence}
              <span className="block text-xs text-muted">
                for {habit.kind === 'break' ? 'slipping on' : 'missing'} {habit.name} on {date}
                {habit.witness && ` · witness: ${habit.witness}`}
              </span>
            </span>
            <button
              onClick={() => onPayPenalty(habit.id, date)}
              className="self-start rounded-full bg-moss px-3 py-1 text-sm font-medium text-ink transition-colors hover:bg-moss-dim hover:text-paper sm:self-auto"
            >
              I paid it
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
  const owedSection = owed.length > 0 && (
    <section className="px-5 pt-4 sm:px-8">
      <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-rose">Owed from yesterday</h3>
      <ul className="flex flex-col gap-2">
        {owed.map((habit) => (
          <li
            key={habit.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-rose px-4 py-3"
          >
            <span className="font-body text-paper">{habit.name}</span>
            <button
              onClick={() => onRepay(habit.id)}
              className="rounded-full bg-moss px-3 py-1 text-sm font-medium text-ink transition-colors hover:bg-moss-dim hover:text-paper"
            >
              Pay back
            </button>
          </li>
        ))}
      </ul>
    </section>
  )

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-display text-xl text-paper">No habits yet</p>
        <p className="max-w-xs text-sm text-muted">
          Add the first habit you want to keep — a daily one, or something scheduled for specific days.
        </p>
        <button
          onClick={onAddHabit}
          className="mt-2 flex items-center gap-2 rounded-full bg-moss px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-moss-dim hover:text-paper"
        >
          <Plus size={16} /> Add a habit
        </button>
      </div>
    )
  }

  if (scheduled.length === 0) {
    return (
      <>
        {penaltySection}
        {owedSection}
        <p className="py-16 text-center text-sm text-muted">Nothing scheduled for today. Enjoy the rest day.</p>
      </>
    )
  }

  // Break habits: tapping logs a slip, so ask first. Tapping again undoes it.
  const handleTap = (habit: Habit, slipped: boolean) => {
    if (habit.kind === 'break' && !slipped && !window.confirm(`Log a slip for "${habit.name}"?`)) return
    onToggle(habit.id)
  }

  return (
    <>
    {penaltySection}
    {owedSection}
    <ul className="flex flex-col gap-2 px-5 py-4 sm:px-8">
      {scheduled.map((habit) => {
        const slipped = doneToday.includes(habit.id)
        // For break habits "done" means clean today; only build habits get struck through.
        const done = habit.kind === 'break' ? !slipped : slipped
        const finished = habit.kind === 'build' && done
        const streak = calculateStreak(habit, log, today)
        const atRisk = !done && missedYesterday(habit, log, today)

        return (
          <li key={habit.id}>
            <button
              onClick={() => handleTap(habit, slipped)}
              className="flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors hover:border-muted"
              style={{ borderColor: atRisk ? 'var(--color-rose)' : 'var(--color-hairline)' }}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                style={{
                  borderColor: done ? habit.color : 'var(--color-hairline)',
                  backgroundColor: done ? habit.color : 'transparent',
                }}
              >
                {done && <Check size={14} className="text-ink" strokeWidth={3} />}
              </span>

              <span className="flex-1">
                <span className={`block font-body ${finished ? 'text-muted line-through' : 'text-paper'}`}>
                  {habit.name}
                </span>
                {habit.kind === 'break' && habit.cue && !slipped && (
                  <span className="block text-xs text-muted">when {habit.cue}</span>
                )}
                {habit.kind === 'break' && habit.replacement && !slipped && (
                  <span className="block text-xs text-muted">instead: {habit.replacement}</span>
                )}
                {habit.stackAfterHabitName && !finished && (
                  <span className="block text-xs text-muted">after "{habit.stackAfterHabitName}"</span>
                )}
                {habit.identity && !finished && (
                  <span className="block text-xs text-muted">for the {habit.identity} you're becoming</span>
                )}
              </span>

              {habit.kind === 'break' && slipped && (
                <span className="whitespace-nowrap font-mono text-xs text-rose">slipped</span>
              )}
              {!atRisk && streak.current > 0 && (
                <span className="flex items-center gap-1 font-mono text-xs text-amber">
                  <Flame size={13} /> {streak.current}
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
    </>
  )
}
