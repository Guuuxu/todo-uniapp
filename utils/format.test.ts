import { describe, it, expect } from 'vitest'
import { formatDate, formatTime, formatNumber } from './format'

describe('formatDate', () => {
  it('should format date with default format YYYY-MM-DD', () => {
    const date = new Date('2024-01-15T10:30:00')
    expect(formatDate(date)).toBe('2024-01-15')
  })

  it('should format date string', () => {
    expect(formatDate('2024-03-25')).toBe('2024-03-25')
  })

  it('should handle custom format', () => {
    const date = new Date('2024-01-05T10:30:00')
    expect(formatDate(date, 'YYYY/MM/DD')).toBe('2024/01/05')
  })

  it('should return empty string for invalid date', () => {
    expect(formatDate('invalid-date')).toBe('')
  })
})

describe('formatTime', () => {
  it('should format time with default format HH:mm:ss', () => {
    const date = new Date('2024-01-15T09:05:03')
    expect(formatTime(date)).toBe('09:05:03')
  })

  it('should format time string', () => {
    const date = new Date('2024-01-15T14:30:45')
    expect(formatTime(date)).toBe('14:30:45')
  })

  it('should handle custom format', () => {
    const date = new Date('2024-01-15T09:05:03')
    expect(formatTime(date, 'HH:mm')).toBe('09:05')
  })

  it('should return empty string for invalid date', () => {
    expect(formatTime('invalid-date')).toBe('')
  })
})

describe('formatNumber', () => {
  it('should format number with default decimals 0', () => {
    expect(formatNumber(1234)).toBe('1234')
  })

  it('should format number with specified decimals', () => {
    expect(formatNumber(1234.5678, 2)).toBe('1234.57')
  })

  it('should format number with thousands separator', () => {
    expect(formatNumber(1234567, 0, true)).toBe('1,234,567')
  })

  it('should format number with decimals and thousands separator', () => {
    expect(formatNumber(1234567.89, 2, true)).toBe('1,234,567.89')
  })

  it('should return "0" for NaN', () => {
    expect(formatNumber(NaN)).toBe('0')
  })
})
