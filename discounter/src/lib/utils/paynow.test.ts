import { describe, it, expect } from 'vitest'
import { buildPayNowQRString, extractLastName, buildPaymentRef } from './paynow'

describe('extractLastName', () => {
  it('returns last word of a multi-word name', () => {
    expect(extractLastName('John Doe')).toBe('Doe')
    expect(extractLastName('Muhammad Ali Khan')).toBe('Khan')
  })

  it('returns the name itself for single-word names', () => {
    expect(extractLastName('Rajesh')).toBe('Rajesh')
  })

  it('handles extra whitespace', () => {
    expect(extractLastName('  John   Doe  ')).toBe('Doe')
  })
})

describe('buildPaymentRef', () => {
  it('builds LASTNAME POSTALCODE format', () => {
    expect(buildPaymentRef('John Doe', '760123')).toBe('DOE 760123')
  })

  it('uppercases the result', () => {
    expect(buildPaymentRef('jane smith', '123456')).toBe('SMITH 123456')
  })

  it('truncates to 25 characters', () => {
    const longName = 'Superlongfirstname Superlonglastname'
    const ref = buildPaymentRef(longName, '123456')
    expect(ref.length).toBeLessThanOrEqual(25)
  })
})

describe('buildPayNowQRString', () => {
  it('starts with payload format indicator', () => {
    const qr = buildPayNowQRString({
      mobile: '83638499',
      amount: 10.50,
      reference: 'DOE 760123',
    })
    expect(qr.startsWith('000201')).toBe(true)
  })

  it('contains PayNow identifier', () => {
    const qr = buildPayNowQRString({
      mobile: '83638499',
      amount: 10.50,
      reference: 'DOE 760123',
    })
    expect(qr).toContain('SG.PAYNOW')
  })

  it('contains the mobile number with +65 prefix', () => {
    const qr = buildPayNowQRString({
      mobile: '83638499',
      amount: 10.50,
      reference: 'DOE 760123',
    })
    expect(qr).toContain('+6583638499')
  })

  it('does not double-prefix +65', () => {
    const qr = buildPayNowQRString({
      mobile: '+6583638499',
      amount: 10.50,
      reference: 'DOE 760123',
    })
    // Should contain +65 once, not +65+65
    expect(qr).not.toContain('+65+65')
    expect(qr).toContain('+6583638499')
  })

  it('contains the amount', () => {
    const qr = buildPayNowQRString({
      mobile: '83638499',
      amount: 10.50,
      reference: 'DOE 760123',
    })
    expect(qr).toContain('10.50')
  })

  it('contains SGD currency code 702', () => {
    const qr = buildPayNowQRString({
      mobile: '83638499',
      amount: 5.00,
      reference: 'TEST',
    })
    expect(qr).toContain('702')
  })

  it('contains merchant name', () => {
    const qr = buildPayNowQRString({
      mobile: '83638499',
      amount: 5.00,
      reference: 'TEST',
      merchantName: 'Discounter SG',
    })
    expect(qr).toContain('Discounter SG')
  })

  it('ends with a 4-char CRC', () => {
    const qr = buildPayNowQRString({
      mobile: '83638499',
      amount: 10.50,
      reference: 'DOE 760123',
    })
    // CRC is 4 hex chars at the end, after "6304" tag
    expect(qr).toMatch(/6304[0-9A-F]{4}$/)
  })

  it('produces deterministic output for same inputs', () => {
    const params = { mobile: '83638499', amount: 10.50, reference: 'DOE 760123' }
    const qr1 = buildPayNowQRString(params)
    const qr2 = buildPayNowQRString(params)
    expect(qr1).toBe(qr2)
  })
})
