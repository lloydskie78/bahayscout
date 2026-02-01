import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { parseFilters } from '@/lib/utils/filters'
import { listingSchema } from '@/lib/validations/listing'
import { nanoid } from 'nanoid'
import { transformListing, transformProfile } from '@/lib/supabase/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const searchParams = request.nextUrl.searchParams
    const filters = parseFilters(searchParams)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    // Build query - use simpler foreign key syntax
    let query = supabase
      .from('listings')
      .select(`
        *,
        profiles!owner_id (id, display_name, is_verified),
        locations!location_id (*),
        listing_photos (id, storage_path, sort_order)
      `, { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType)
    }
    if (filters.minPrice !== undefined) {
      query = query.gte('price_php', filters.minPrice)
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price_php', filters.maxPrice)
    }
    if (filters.bedrooms !== undefined) {
      query = query.gte('bedrooms', filters.bedrooms)
    }
    if (filters.bathrooms !== undefined) {
      query = query.gte('bathrooms', filters.bathrooms)
    }
    if (filters.minFloorArea !== undefined) {
      query = query.gte('floor_area_sqm', filters.minFloorArea)
    }
    if (filters.maxFloorArea !== undefined) {
      query = query.lte('floor_area_sqm', filters.maxFloorArea)
    }

    // Handle search - only if search_tsv column exists
    if (filters.search) {
      try {
        query = query.textSearch('search_tsv', filters.search, { type: 'websearch' })
      } catch (searchError) {
        // If text search fails, fall back to ILIKE search on title/description
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
    }

    const { data: listings, error, count } = await query

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    const transformedListings = listings?.map(transformListing) || []

    return NextResponse.json({
      listings: transformedListings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching listings:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.role !== 'lister' && profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Lister role required' }, { status: 403 })
    }

    const body = await request.json()
    const validated = listingSchema.parse(body)

    // Generate slug from title
    const baseSlug = validated.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const slug = `${baseSlug}-${nanoid(8)}`

    // Create listing
    const { data: createdListing, error: createError } = await supabase
      .from('listings')
      .insert({
        category: validated.category,
        property_type: validated.propertyType,
        title: validated.title,
        description: validated.description,
        price_php: validated.pricePhp,
        price_period: validated.pricePeriod,
        bedrooms: validated.bedrooms,
        bathrooms: validated.bathrooms,
        floor_area_sqm: validated.floorAreaSqm || null,
        lot_area_sqm: validated.lotAreaSqm || null,
        location_id: validated.locationId,
        address_line: validated.addressLine,
        slug,
        owner_id: profile.id,
        status: 'draft',
      })
      .select()
      .single()

    if (createError) throw createError

    // If coordinates provided, update with PostGIS point
    if (validated.latitude && validated.longitude) {
      await supabase.rpc('update_listing_geom', {
        listing_id: createdListing.id,
        lng: validated.longitude,
        lat: validated.latitude,
      })
    }

    return NextResponse.json({ listing: transformListing(createdListing) }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating listing:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
