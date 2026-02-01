import { createServerSupabase, createServiceRoleClient } from './server'

// Type definitions matching the database schema
export interface Profile {
  id: string
  user_id: string
  role: string
  display_name: string | null
  phone: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Location {
  id: number
  region: string
  province: string
  city_municipality: string
  barangay: string | null
  postal_code: string | null
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  owner_id: string
  status: string
  category: string
  property_type: string
  title: string
  description: string
  price_php: number
  price_period: string | null
  bedrooms: number | null
  bathrooms: number | null
  floor_area_sqm: number | null
  lot_area_sqm: number | null
  location_id: number
  address_line: string | null
  slug: string
  created_at: string
  updated_at: string
}

export interface ListingPhoto {
  id: string
  listing_id: string
  storage_path: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Inquiry {
  id: string
  listing_id: string
  from_user_id: string | null
  name: string
  email: string
  phone: string | null
  message: string
  status: string
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  listing_id: string
  reporter_user_id: string | null
  reason: string
  details: string | null
  status: string
  created_at: string
  updated_at: string
}

// Helper to transform snake_case to camelCase for frontend compatibility
export function transformListing(listing: any) {
  return {
    id: listing.id,
    ownerId: listing.owner_id,
    status: listing.status,
    category: listing.category,
    propertyType: listing.property_type,
    title: listing.title,
    description: listing.description,
    pricePhp: listing.price_php,
    pricePeriod: listing.price_period,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    floorAreaSqm: listing.floor_area_sqm,
    lotAreaSqm: listing.lot_area_sqm,
    locationId: listing.location_id,
    addressLine: listing.address_line,
    slug: listing.slug,
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
    geom: listing.geom,
    owner: listing.profiles ? {
      id: listing.profiles.id,
      displayName: listing.profiles.display_name,
      isVerified: listing.profiles.is_verified,
      phone: listing.profiles.phone,
    } : listing.owner,
    location: listing.locations ? {
      id: listing.locations.id,
      region: listing.locations.region,
      province: listing.locations.province,
      cityMunicipality: listing.locations.city_municipality,
      barangay: listing.locations.barangay,
      postalCode: listing.locations.postal_code,
    } : listing.location,
    photos: listing.listing_photos?.map((p: any) => ({
      id: p.id,
      listingId: p.listing_id,
      storagePath: p.storage_path,
      sortOrder: p.sort_order,
    })) || listing.photos || [],
  }
}

export function transformProfile(profile: any) {
  return {
    id: profile.id,
    userId: profile.user_id,
    role: profile.role,
    displayName: profile.display_name,
    phone: profile.phone,
    isVerified: profile.is_verified,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }
}

export function transformInquiry(inquiry: any) {
  return {
    id: inquiry.id,
    listingId: inquiry.listing_id,
    fromUserId: inquiry.from_user_id,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    message: inquiry.message,
    status: inquiry.status,
    createdAt: inquiry.created_at,
    updatedAt: inquiry.updated_at,
    listing: inquiry.listings ? {
      title: inquiry.listings.title,
      slug: inquiry.listings.slug,
    } : inquiry.listing,
  }
}

export function transformReport(report: any) {
  return {
    id: report.id,
    listingId: report.listing_id,
    reporterUserId: report.reporter_user_id,
    reason: report.reason,
    details: report.details,
    status: report.status,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
    listing: report.listings ? {
      title: report.listings.title,
      slug: report.listings.slug,
    } : report.listing,
    reporter: report.profiles ? {
      displayName: report.profiles.display_name,
    } : report.reporter,
  }
}
