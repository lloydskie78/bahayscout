import { z } from 'zod'

export const listingSchema = z.object({
  category: z.enum(['sale', 'rent']),
  propertyType: z.enum(['condo', 'house_lot', 'townhouse', 'lot', 'commercial', 'apartment', 'bedspace']),
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  pricePhp: z.number().int().positive(),
  pricePeriod: z.string().optional().nullable(),
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().int().min(0).optional().nullable(),
  floorAreaSqm: z.number().positive().optional().nullable(),
  lotAreaSqm: z.number().positive().optional().nullable(),
  locationId: z.number().int().positive(),
  addressLine: z.string().max(200).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
})

export type ListingInput = z.infer<typeof listingSchema>
