import { describe, expect, it } from 'vitest'
import type { Habit } from '../types'
import { owedPenaltyDates } from './debt'

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
    consequence: 'no phone tonight',
    witness: null,
    paidPenaltyDates: [],
    ...overrides,
  }
}

describe('owedPenaltyDates', () => {
  it('owes nothing without a contract', () => {
    expect(owedPenaltyDates(habit({ consequence: null }), {}, today)).toEqual([])
  })

  it('does not owe yesterday: it can still be repaid', () => {
    expect(owedPenaltyDates(habit(), {}, today)).not.toContain('2026-11-18')
  })

  it('owes a build miss from two or more days ago', () => {
    expect(owedPenaltyDates(habit(), {}, today)).toContain('2026-11-17')
  })

  it('drops a build miss once it is repaid or paid', () => {
    const repaid = owedPenaltyDates(habit(), { '2026-11-17': [1] }, today)
    expect(repaid).not.toContain('2026-11-17')

    const paid = owedPenaltyDates(habit({ paidPenaltyDates: ['2026-11-17'] }), {}, today)
    expect(paid).not.toContain('2026-11-17')
  })

  it('owes a break slip logged today', () => {
    const slip = owedPenaltyDates(habit({ kind: 'break' }), { '2026-11-19': [1] }, today)
    expect(slip).toEqual(['2026-11-19'])
  })

  it('owes nothing for a clean break habit', () => {
    expect(owedPenaltyDates(habit({ kind: 'break' }), {}, today)).toEqual([])
  })

  it('ignores days from before the habit existed', () => {
    const young = habit({ createdAt: '2026-11-18T12:00:00' })
    expect(owedPenaltyDates(young, {}, today)).not.toContain('2026-11-17')
  })

  it('expires misses older than the lookback window', () => {
    const owed = owedPenaltyDates(habit({ createdAt: '2026-01-01T09:00:00' }), {}, today)
    expect(owed).not.toContain('2026-11-04') // 15 days ago
    expect(owed).toContain('2026-11-05') // 14 days ago
  })
})
