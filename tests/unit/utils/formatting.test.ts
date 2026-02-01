import { formatCurrency, formatPropertyType, formatArea } from '@/lib/utils/formatting'

describe('formatting utilities', () => {
  describe('formatCurrency', () => {
    it('formats PHP currency correctly', () => {
      expect(formatCurrency(1000000)).toContain('₱')
      expect(formatCurrency(1000000)).toContain('1,000,000')
    })

    it('handles bigint values', () => {
      expect(formatCurrency(BigInt(5000000))).toContain('5,000,000')
    })
  })

  describe('formatPropertyType', () => {
    it('formats property types correctly', () => {
      expect(formatPropertyType('condo')).toBe('Condo')
      expect(formatPropertyType('house_lot')).toBe('House & Lot')
      expect(formatPropertyType('unknown')).toBe('unknown')
    })
  })

  describe('formatArea', () => {
    it('formats area in sqm', () => {
      expect(formatArea(100)).toContain('100')
      expect(formatArea(100)).toContain('sqm')
    })

    it('returns N/A for null/undefined', () => {
      expect(formatArea(null)).toBe('N/A')
      expect(formatArea(undefined)).toBe('N/A')
    })
  })
})
