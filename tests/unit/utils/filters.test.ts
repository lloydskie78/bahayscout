import { parseFilters } from '@/lib/utils/filters'

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

    it('parses location params correctly', () => {
      const params = new URLSearchParams({
        region: 'NCR',
        province: 'Metro Manila',
        city: 'Makati',
        barangay: 'Poblacion',
      })

      const filters = parseFilters(params)

      expect(filters.region).toBe('NCR')
      expect(filters.province).toBe('Metro Manila')
      expect(filters.city).toBe('Makati')
      expect(filters.barangay).toBe('Poblacion')
    })

    it('parses property type and area filters', () => {
      const params = new URLSearchParams({
        propertyType: 'condo',
        minFloorArea: '50',
        maxFloorArea: '100',
        minLotArea: '100',
        maxLotArea: '500',
      })

      const filters = parseFilters(params)

      expect(filters.propertyType).toBe('condo')
      expect(filters.minFloorArea).toBe(50)
      expect(filters.maxFloorArea).toBe(100)
      expect(filters.minLotArea).toBe(100)
      expect(filters.maxLotArea).toBe(500)
    })

    it('parses boolean filters', () => {
      const params = new URLSearchParams({
        petFriendly: 'true',
      })

      const filters = parseFilters(params)

      expect(filters.petFriendly).toBe(true)
    })
  })
})
