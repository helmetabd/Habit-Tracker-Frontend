import { Check, Flame, Plus } from 'lucide-react'
import type { CompletionLog, Habit } from '../types'
import { isScheduledOn, todayKey } from '../lib/dates'
import { calculateStreak, missedYesterday } from '../lib/streaks'

interface TodayListProps {
  habits: Habit[]
  log: CompletionLog
  onToggle: (habitId: number) => void
  onAddHabit: () => void
}

export function TodayList({ habits, log, onToggle, onAddHabit }: TodayListProps) {
  const today = new Date()
  const key = todayKey()
  const scheduled = habits.filter((h) => isScheduledOn(h, today))
  const doneToday = log[key] ?? []

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
      <p className="py-16 text-center text-sm text-muted">Nothing scheduled for today. Enjoy the rest day.</p>
    )
  }

  return (
    <ul className="flex flex-col gap-2 px-5 py-4 sm:px-8">
      {scheduled.map((habit) => {
        const done = doneToday.includes(habit.id)
        const streak = calculateStreak(habit, log, today)
        const atRisk = !done && missedYesterday(habit, log, today)

        return (
          <li key={habit.id}>
            <button
              onClick={() => onToggle(habit.id)}
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
                <span className={`block font-body ${done ? 'text-muted line-through' : 'text-paper'}`}>
                  {habit.name}
                </span>
                {habit.stackAfterHabitName && !done && (
                  <span className="block text-xs text-muted">after "{habit.stackAfterHabitName}"</span>
                )}
                {habit.identity && !done && (
                  <span className="block text-xs text-muted">for the {habit.identity} you're becoming</span>
                )}
              </span>

              {atRisk && (
                <span className="whitespace-nowrap font-mono text-xs text-rose">don't miss twice</span>
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
  )
}
