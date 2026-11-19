import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CompletionLog, Habit } from '../types'
import { lastNDays } from '../lib/dates'
import { calculateStreak, completionRate } from '../lib/streaks'

interface StatsPanelProps {
  habits: Habit[]
  log: CompletionLog
  onAddHabit: () => void
}

export function StatsPanel({ habits, log, onAddHabit }: StatsPanelProps) {
  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
        <p className="font-display text-xl text-paper">No stats yet</p>
        <p className="max-w-xs text-sm text-muted">Stats appear once you have a habit and a few days of logs.</p>
        <button
          onClick={onAddHabit}
          className="mt-2 rounded-full bg-moss px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-moss-dim hover:text-paper"
        >
          Add a habit
        </button>
      </div>
    )
  }

  const buildIds = new Set(habits.filter((h) => h.kind === 'build').map((h) => h.id))
  const breakIds = new Set(habits.filter((h) => h.kind === 'break').map((h) => h.id))
  const weekKeys = lastNDays(7)
  const chartData = weekKeys.map((key) => {
    const label = new Date(key).toLocaleDateString(undefined, { weekday: 'short' })
    const ids = log[key] ?? []
    // Slips are their own series: a slip must never read as a completion.
    return {
      label,
      completed: ids.filter((id) => buildIds.has(id)).length,
      slipped: ids.filter((id) => breakIds.has(id)).length,
    }
  })

  return (
    <div className="flex flex-col gap-6 px-5 py-4 sm:px-8">
      <div>
        <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted">Last 7 days</h3>
        <p className="mb-3 flex gap-4 font-mono text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-moss" />
            Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose" />
            Slipped
          </span>
        </p>
        <div className="h-40 rounded-xl border border-hairline bg-surface p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="label"
                stroke="var(--color-muted)"
                fontSize={12}
                fontFamily="var(--font-mono)"
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'var(--color-surface-raised)' }}
                contentStyle={{
                  background: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'var(--font-body)',
                }}
              />
              <Bar dataKey="completed" stackId="day" fill="var(--color-moss)" />
              <Bar dataKey="slipped" stackId="day" fill="var(--color-rose)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">Per habit</h3>
        <ul className="flex flex-col gap-2">
          {habits.map((habit) => {
            const streak = calculateStreak(habit, log)
            const rate = Math.round(completionRate(habit, log, lastNDays(30)) * 100)
            return (
              <li
                key={habit.id}
                className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-4 py-3"
              >
                <span className="flex items-center gap-2 text-sm text-paper">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
                  {habit.name}
                  {habit.identity && <span className="text-xs text-muted">· {habit.identity}</span>}
                </span>
                <span className="flex flex-wrap justify-end gap-x-3 gap-y-1 font-mono text-xs text-muted">
                  <span>streak {streak.current}</span>
                  <span>best {streak.best}</span>
                  <span>{habit.kind === 'break' ? `clean ${rate}%` : `${rate}%`} / 30d</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
