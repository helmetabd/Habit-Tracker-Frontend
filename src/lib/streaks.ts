import type { CompletionLog, Habit, HabitStreak } from '../types'
import { addDays, isScheduledOn, toDateKey } from './dates'

/** Break habits are "done" on days they weren't logged, since a logged day is a slip. */
function isDone(habit: Habit, log: CompletionLog, key: string): boolean {
  const logged = log[key]?.includes(habit.id) ?? false
  return habit.kind === 'break' ? !logged : logged
}

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
  const createdKey = toDateKey(new Date(habit.createdAt))
  let current = 0
  let best = 0
  let running = 0
  let stillCounting = true

  for (let i = 0; i < lookbackDays; i++) {
    const date = addDays(today, -i)
    if (!isScheduledOn(habit, date)) continue

    const key = toDateKey(date)
    if (key < createdKey) break // don't count days before the habit existed
    const done = isDone(habit, log, key)

    if (done) {
      running += 1
      best = Math.max(best, running)
      if (stillCounting) current = running
    } else {
      running = 0
      // A slip (break habit) always ends the streak, even today.
      if (key !== todayKey || habit.kind === 'break') stillCounting = false
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
  if (habit.kind === 'break') return false
  const yesterday = addDays(today, -1)
  if (!isScheduledOn(habit, yesterday)) return false
  const key = toDateKey(yesterday)
  if (toDateKey(new Date(habit.createdAt)) > key) return false // no debt for days before it existed
  return !(log[key]?.includes(habit.id) ?? false)
}

export function completionRate(habit: Habit, log: CompletionLog, dateKeys: string[]): number {
  const scheduled = dateKeys.filter((key) => {
    const [y, m, d] = key.split('-').map(Number)
    return isScheduledOn(habit, new Date(y, m - 1, d))
  })
  if (scheduled.length === 0) return 0
  const done = scheduled.filter((key) => isDone(habit, log, key)).length
  return done / scheduled.length
}
