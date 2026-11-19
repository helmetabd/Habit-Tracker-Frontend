import type { Habit, Weekday } from '../types'

/** Local YYYY-MM-DD, avoiding UTC-shift bugs from toISOString(). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function yesterdayKey(): string {
  return toDateKey(addDays(new Date(), -1))
}

export function addDays(date: Date, delta: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + delta)
  return next
}

/** Last `count` days as date keys, oldest first, ending today. */
export function lastNDays(count: number, from: Date = new Date()): string[] {
  const days: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    days.push(toDateKey(addDays(from, -i)))
  }
  return days
}

export function isScheduledOn(habit: Habit, date: Date): boolean {
  if (habit.activeDays.length === 0) return true
  return habit.activeDays.includes(date.getDay() as Weekday)
}

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
}
