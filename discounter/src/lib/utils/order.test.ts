import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatSGD, calcDiscountPct, daysUntilExpiry, expiryLabel, expiryUrgency, getWeeklyCutoff } from './order'

describe('formatSGD', () => {
  it('formats whole numbers with two decimals', () => {
    expect(formatSGD(5)).toBe('S$5.00')
  })

  it('formats fractional amounts', () => {
    expect(formatSGD(3.5)).toBe('S$3.50')
    expect(formatSGD(12.99)).toBe('S$12.99')
  })

  it('formats zero', () => {
    expect(formatSGD(0)).toBe('S$0.00')
  })
})

describe('calcDiscountPct', () => {
  it('calculates correct discount percentage', () => {
    expect(calcDiscountPct(10, 4)).toBe(60)
    expect(calcDiscountPct(15.90, 5.90)).toBe(63)
  })

  it('returns 0 when prices are equal', () => {
    expect(calcDiscountPct(10, 10)).toBe(0)
  })

  it('rounds to nearest integer', () => {
    expect(calcDiscountPct(3, 1)).toBe(67) // 66.67 -> 67
  })
})

describe('daysUntilExpiry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns positive days for future expiry', () => {
    expect(daysUntilExpiry('2025-07-01')).toBe(30)
  })

  it('returns negative days for past expiry', () => {
    expect(daysUntilExpiry('2025-05-01')).toBe(-31)
  })

  it('returns 0 or 1 for today', () => {
    const result = daysUntilExpiry('2025-06-01')
    expect(result).toBeLessThanOrEqual(1)
    expect(result).toBeGreaterThanOrEqual(0)
  })
})

describe('expiryLabel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows days for items expiring within 30 days', () => {
    expect(expiryLabel('2025-06-15')).toMatch(/Expires in \d+d/)
  })

  it('shows weeks for items expiring within 60 days', () => {
    expect(expiryLabel('2025-07-15')).toMatch(/Expires in ~\d+wk/)
  })

  it('shows month/year for items expiring later', () => {
    expect(expiryLabel('2025-12-15')).toMatch(/Exp: Dec 2025/)
  })
})

describe('expiryUrgency', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns critical for items expiring within 60 days', () => {
    expect(expiryUrgency('2025-07-15')).toBe('critical')
  })

  it('returns warning for items expiring within 120 days', () => {
    expect(expiryUrgency('2025-09-15')).toBe('warning')
  })

  it('returns ok for items expiring after 120 days', () => {
    expect(expiryUrgency('2025-12-15')).toBe('ok')
  })
})

describe('getWeeklyCutoff', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns a Sunday', () => {
    vi.setSystemTime(new Date('2025-06-04T10:00:00')) // Wednesday
    const cutoff = getWeeklyCutoff()
    expect(cutoff.getDay()).toBe(0) // Sunday
  })

  it('returns 23:59:59', () => {
    vi.setSystemTime(new Date('2025-06-04T10:00:00'))
    const cutoff = getWeeklyCutoff()
    expect(cutoff.getHours()).toBe(23)
    expect(cutoff.getMinutes()).toBe(59)
    expect(cutoff.getSeconds()).toBe(59)
  })

  it('returns the upcoming Sunday, not a past one', () => {
    vi.setSystemTime(new Date('2025-06-04T10:00:00')) // Wed Jun 4
    const cutoff = getWeeklyCutoff()
    expect(cutoff.getDate()).toBe(8) // Sun Jun 8
  })
})
