import type { CompletionLog, Habit, HabitStreak } from '../types'
import { addDays, isScheduledOn, toDateKey } from './dates'

/**
 * Walks backward from today over the habit's scheduled days only, so rest
 * days never break a streak. A not-yet-done "today" doesn't break it either
 * (it's still open), but any earlier missed scheduled day does.
 */
export function calculateStreak(
  habit: Habit,
  log: CompletionLog,
  today: Date = new Date(),
  lookbackDays = 365,
): HabitStreak {
  const todayKey = toDateKey(today)
  let current = 0
  let best = 0
  let running = 0
  let stillCounting = true

  for (let i = 0; i < lookbackDays; i++) {
    const date = addDays(today, -i)
    if (!isScheduledOn(habit, date)) continue

    const key = toDateKey(date)
    const done = log[key]?.includes(habit.id) ?? false

    if (done) {
      running += 1
      best = Math.max(best, running)
      if (stillCounting) current = running
    } else {
      running = 0
      if (key !== todayKey) stillCounting = false
    }
  }

  return { current, best }
}

/**
 * "Missing once is an accident. Missing twice is the start of a new habit."
 * True when the habit was scheduled yesterday and not completed — a single
 * miss worth a gentle nudge, distinct from a fully broken chain.
 */
export function missedYesterday(habit: Habit, log: CompletionLog, today: Date = new Date()): boolean {
  const yesterday = addDays(today, -1)
  if (!isScheduledOn(habit, yesterday)) return false
  const key = toDateKey(yesterday)
  return !(log[key]?.includes(habit.id) ?? false)
}

export function completionRate(habit: Habit, log: CompletionLog, dateKeys: string[]): number {
  const scheduled = dateKeys.filter((key) => {
    const [y, m, d] = key.split('-').map(Number)
    return isScheduledOn(habit, new Date(y, m - 1, d))
  })
  if (scheduled.length === 0) return 0
  const done = scheduled.filter((key) => log[key]?.includes(habit.id)).length
  return done / scheduled.length
}
