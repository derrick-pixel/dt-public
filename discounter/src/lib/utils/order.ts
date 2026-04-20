import { addDays, nextSunday, format, isBefore, setHours, setMinutes, setSeconds } from 'date-fns'

/**
 * Returns the upcoming weekly cutoff — every Sunday at 23:59:59 SGT.
 * Orders placed before this cutoff are batched for the following week's delivery.
 */
export function getWeeklyCutoff(): Date {
  const now = new Date()
  const cutoff = setSeconds(setMinutes(setHours(nextSunday(now), 23), 59), 59)
  return cutoff
}

export function getWeeklyCutoffLabel(): string {
  return format(getWeeklyCutoff(), "EEE, d MMM yyyy 'at' h:mm a")
}

export function getWeekCutoffDate(): string {
  return format(getWeeklyCutoff(), 'yyyy-MM-dd')
}

export function formatSGD(amount: number): string {
  return `S$${amount.toFixed(2)}`
}

export function calcDiscountPct(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100)
}

export function daysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate)
  const now = new Date()
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function expiryLabel(expiryDate: string): string {
  const days = daysUntilExpiry(expiryDate)
  if (days <= 30) return `Expires in ${days}d`
  if (days <= 60) return `Expires in ~${Math.ceil(days / 7)}wk`
  return `Exp: ${format(new Date(expiryDate), 'MMM yyyy')}`
}

export function expiryUrgency(expiryDate: string): 'critical' | 'warning' | 'ok' {
  const days = daysUntilExpiry(expiryDate)
  if (days <= 60) return 'critical'
  if (days <= 120) return 'warning'
  return 'ok'
}
