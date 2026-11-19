import type { CompletionLog, Habit } from '../types'
import { isScheduledOn, lastNDays, yesterdayKey } from '../lib/dates'

interface LedgerGridProps {
  habits: Habit[]
  log: CompletionLog
  onToggleCell: (habitId: number, dateKey: string) => void
  onEditHabit: (habit: Habit) => void
  days?: number
}

export function LedgerGrid({ habits, log, onToggleCell, onEditHabit, days = 28 }: LedgerGridProps) {
  const dateKeys = lastNDays(days)

  if (habits.length === 0) return null

  return (
    <div className="overflow-x-auto px-5 py-4 sm:px-8">
      <div className="inline-block min-w-full">
        <div className="grid gap-y-2" style={{ gridTemplateColumns: `140px repeat(${days}, 14px)` }}>
          <div />
          {dateKeys.map((key) => {
            const day = Number(key.slice(-2))
            const isMonday = new Date(key).getDay() === 1
            return (
              <div key={key} className="flex justify-center font-mono text-[9px] text-muted">
                {isMonday ? day : ''}
              </div>
            )
          })}

          {habits.map((habit) => (
            <RowFragment
              key={habit.id}
              habit={habit}
              dateKeys={dateKeys}
              log={log}
              onToggleCell={onToggleCell}
              onEditHabit={onEditHabit}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function RowFragment({
  habit,
  dateKeys,
  log,
  onToggleCell,
  onEditHabit,
}: {
  habit: Habit
  dateKeys: string[]
  log: CompletionLog
  onToggleCell: (habitId: number, dateKey: string) => void
  onEditHabit: (habit: Habit) => void
}) {
  // Consecutive scheduled misses ending at each day, so two-in-a-row (a
  // broken chain) reads differently from a single, forgivable slip.
  let runningMiss = 0
  const cells = dateKeys.map((key) => {
    const [y, m, d] = key.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    const scheduled = isScheduledOn(habit, date)
    const done = log[key]?.includes(habit.id) ?? false

    // For break habits a logged day is the failure (a slip), so the meaning flips.
    const failed = habit.kind === 'break' ? done : !done
    if (scheduled) runningMiss = failed ? runningMiss + 1 : 0
    return { key, scheduled, done, broken: habit.kind === 'build' && runningMiss >= 2 }
  })

  return (
    <>
      <button
        onClick={() => onEditHabit(habit)}
        className="truncate pr-3 text-left font-body text-sm text-paper hover:text-muted"
        title="Edit habit"
      >
        {habit.name}
      </button>
      {cells.map(({ key, scheduled, done, broken }) => (
        <button
          key={key}
          disabled={!scheduled || key < yesterdayKey()}
          onClick={() => onToggleCell(habit.id, key)}
          className="mx-auto h-3 w-3 rounded-[3px] transition-colors disabled:cursor-default"
          style={{
            backgroundColor: done
              ? habit.kind === 'break' ? 'var(--color-rose)' : habit.color
              : scheduled ? 'var(--color-surface-raised)' : 'transparent',
            border: !scheduled ? 'none' : broken ? '1px solid var(--color-rose)' : '1px solid var(--color-hairline)',
          }}
        />
      ))}
    </>
  )
}
