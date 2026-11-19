import type { CompletionLog, Habit } from '../types'
import { addDays, isScheduledOn, toDateKey } from './dates'

/** How far back an unpaid penalty still counts. Older ones expire (avoids the all-or-nothing spiral). */
export const LOOKBACK_DAYS = 14

/**
 * Dates whose penalty is owed and not yet paid. Only habits with a contract owe anything.
 * - Build habit: a scheduled day that was missed and is at least two days old. Yesterday is
 *   still repayable, so it isn't owed yet.
 * - Break habit: any logged slip, including today.
 */
export function owedPenaltyDates(habit: Habit, log: CompletionLog, today: Date = new Date()): string[] {
  if (!habit.consequence) return []

  const createdKey = toDateKey(new Date(habit.createdAt))
  const firstDaysAgo = habit.kind === 'break' ? 0 : 2
  const owed: string[] = []

  for (let i = firstDaysAgo; i <= LOOKBACK_DAYS; i++) {
    const date = addDays(today, -i)
    const key = toDateKey(date)
    if (key < createdKey || !isScheduledOn(habit, date)) continue

    const logged = log[key]?.includes(habit.id) ?? false
    const failed = habit.kind === 'break' ? logged : !logged
    if (failed && !habit.paidPenaltyDates.includes(key)) owed.push(key)
  }

  return owed
}
