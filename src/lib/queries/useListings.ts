import { useQuery } from '@tanstack/react-query'
import { type ListingFilters } from '@/lib/utils/filters'

interface ListingsResponse {
  listings: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useListings(filters: ListingFilters, page: number = 1, limit: number = 20) {
  return useQuery<ListingsResponse>({
    queryKey: ['listings', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.category) params.set('category', filters.category)
      if (filters.propertyType) params.set('propertyType', filters.propertyType)
      if (filters.minPrice) params.set('minPrice', filters.minPrice.toString())
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString())
      if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString())
      if (filters.bathrooms) params.set('bathrooms', filters.bathrooms.toString())
      if (filters.minFloorArea) params.set('minFloorArea', filters.minFloorArea.toString())
      if (filters.maxFloorArea) params.set('maxFloorArea', filters.maxFloorArea.toString())
      if (filters.minLotArea) params.set('minLotArea', filters.minLotArea.toString())
      if (filters.maxLotArea) params.set('maxLotArea', filters.maxLotArea.toString())
      if (filters.locationId) params.set('locationId', filters.locationId.toString())
      if (filters.region) params.set('region', filters.region)
      if (filters.province) params.set('province', filters.province)
      if (filters.city) params.set('city', filters.city)
      if (filters.barangay) params.set('barangay', filters.barangay)
      params.set('page', page.toString())
      params.set('limit', limit.toString())

      const response = await fetch(`/api/listings?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch listings')
      return response.json()
    },
  })
}
