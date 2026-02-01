import { type PropertyType, type ListingCategory } from '@/types'

export interface ListingFilters {
  search?: string
  category?: ListingCategory
  propertyType?: PropertyType
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  minFloorArea?: number
  maxFloorArea?: number
  minLotArea?: number
  maxLotArea?: number
  locationId?: number
  region?: string
  province?: string
  city?: string
  barangay?: string
  petFriendly?: boolean
}

export function parseFilters(searchParams: URLSearchParams): ListingFilters {
  const filters: ListingFilters = {}

  const search = searchParams.get('search')
  if (search) filters.search = search

  const category = searchParams.get('category') as ListingCategory | null
  if (category && (category === 'sale' || category === 'rent')) {
    filters.category = category
  }

  const propertyType = searchParams.get('propertyType') as PropertyType | null
  if (propertyType) {
    filters.propertyType = propertyType
  }

  const minPrice = searchParams.get('minPrice')
  if (minPrice) filters.minPrice = parseInt(minPrice, 10)

  const maxPrice = searchParams.get('maxPrice')
  if (maxPrice) filters.maxPrice = parseInt(maxPrice, 10)

  const bedrooms = searchParams.get('bedrooms')
  if (bedrooms) filters.bedrooms = parseInt(bedrooms, 10)

  const bathrooms = searchParams.get('bathrooms')
  if (bathrooms) filters.bathrooms = parseInt(bathrooms, 10)

  const minFloorArea = searchParams.get('minFloorArea')
  if (minFloorArea) filters.minFloorArea = parseFloat(minFloorArea)

  const maxFloorArea = searchParams.get('maxFloorArea')
  if (maxFloorArea) filters.maxFloorArea = parseFloat(maxFloorArea)

  const minLotArea = searchParams.get('minLotArea')
  if (minLotArea) filters.minLotArea = parseFloat(minLotArea)

  const maxLotArea = searchParams.get('maxLotArea')
  if (maxLotArea) filters.maxLotArea = parseFloat(maxLotArea)

  const locationId = searchParams.get('locationId')
  if (locationId) filters.locationId = parseInt(locationId, 10)

  const region = searchParams.get('region')
  if (region) filters.region = region

  const province = searchParams.get('province')
  if (province) filters.province = province

  const city = searchParams.get('city')
  if (city) filters.city = city

  const barangay = searchParams.get('barangay')
  if (barangay) filters.barangay = barangay

  const petFriendly = searchParams.get('petFriendly')
  if (petFriendly === 'true') filters.petFriendly = true

  return filters
}

