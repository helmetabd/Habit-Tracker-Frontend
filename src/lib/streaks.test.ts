import { describe, expect, it } from 'vitest'
import type { CompletionLog, Habit } from '../types'
import { calculateStreak, missedYesterday } from './streaks'

const today = new Date(2026, 10, 19) // 19 Nov 2026, local time

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 1,
    name: 'Read',
    color: '#000000',
    activeDays: [],
    reminderTime: null,
    createdAt: '2026-11-01T09:00:00',
    archived: false,
    identity: null,
    stackAfterHabitId: null,
    stackAfterHabitName: null,
    kind: 'build',
    cue: null,
    replacement: null,
    consequence: null,
    witness: null,
    paidPenaltyDates: [],
    ...overrides,
  }
}

describe('calculateStreak', () => {
  it('counts consecutive completed days up to today', () => {
    const log: CompletionLog = { '2026-11-19': [1], '2026-11-18': [1], '2026-11-17': [1] }
    expect(calculateStreak(habit(), log, today).current).toBe(3)
  })

  it('counts a clean break habit: days without a slip', () => {
    const streak = calculateStreak(habit({ kind: 'break' }), { '2026-11-17': [1] }, today)
    expect(streak.current).toBe(2) // 19th and 18th are clean, the 17th is a slip
  })

  it('a slip today resets the current streak to zero', () => {
    const streak = calculateStreak(habit({ kind: 'break' }), { '2026-11-19': [1] }, today)
    expect(streak.current).toBe(0)
  })

  it('does not count days before the habit existed', () => {
    const streak = calculateStreak(habit({ kind: 'break', createdAt: '2026-11-18T12:00:00' }), {}, today)
    expect(streak.best).toBe(2) // only the 18th and 19th
  })
})

describe('missedYesterday', () => {
  it('is never true for a break habit', () => {
    expect(missedYesterday(habit({ kind: 'break' }), {}, today)).toBe(false)
  })

  it('is true for a build habit missed yesterday', () => {
    expect(missedYesterday(habit(), {}, today)).toBe(true)
  })
})
