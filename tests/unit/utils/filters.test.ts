import { parseFilters, buildFilterQuery } from '@/lib/utils/filters'

describe('filter utilities', () => {
  describe('parseFilters', () => {
    it('parses search params correctly', () => {
      const params = new URLSearchParams({
        search: 'condo',
        category: 'rent',
        minPrice: '1000000',
        maxPrice: '5000000',
        bedrooms: '2',
      })

      const filters = parseFilters(params)

      expect(filters.search).toBe('condo')
      expect(filters.category).toBe('rent')
      expect(filters.minPrice).toBe(1000000)
      expect(filters.maxPrice).toBe(5000000)
      expect(filters.bedrooms).toBe(2)
    })

    it('handles missing params', () => {
      const params = new URLSearchParams()
      const filters = parseFilters(params)

      expect(filters.search).toBeUndefined()
      expect(filters.category).toBeUndefined()
    })
  })

  describe('buildFilterQuery', () => {
    it('builds Prisma where clause', () => {
      const filters = {
        category: 'rent' as const,
        propertyType: 'condo' as const,
        minPrice: 1000000,
        maxPrice: 5000000,
        bedrooms: 2,
      }

      const where = buildFilterQuery(filters)

      expect(where.status).toBe('published')
      expect(where.category).toBe('rent')
      expect(where.propertyType).toBe('condo')
      expect(where.pricePhp.gte).toBe(1000000)
      expect(where.pricePhp.lte).toBe(5000000)
      expect(where.bedrooms.gte).toBe(2)
    })
  })
})
