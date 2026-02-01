import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { listingSchema } from '@/lib/validations/listing'
import { transformListing } from '@/lib/supabase/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase()

    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles!owner_id (id, display_name, is_verified, phone),
        locations!location_id (*),
        listing_photos (id, storage_path, sort_order)
      `)
      .eq('id', params.id)
      .single()

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Only allow viewing published listings or own listings
    if (listing.status !== 'published') {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json(transformListing(listing))
  } catch (error: any) {
    console.error('Error fetching listing:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*, profiles!owner_id (*)')
      .eq('id', params.id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if user is owner or admin
    if (profile.id !== listing.owner_id && profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validated = listingSchema.partial().parse(body)

    // Build update object
    const updateData: Record<string, any> = {}
    if (validated.category) updateData.category = validated.category
    if (validated.propertyType) updateData.property_type = validated.propertyType
    if (validated.title) updateData.title = validated.title
    if (validated.description) updateData.description = validated.description
    if (validated.pricePhp) updateData.price_php = validated.pricePhp
    if (validated.pricePeriod !== undefined) updateData.price_period = validated.pricePeriod
    if (validated.bedrooms !== undefined) updateData.bedrooms = validated.bedrooms
    if (validated.bathrooms !== undefined) updateData.bathrooms = validated.bathrooms
    if (validated.floorAreaSqm !== undefined) updateData.floor_area_sqm = validated.floorAreaSqm
    if (validated.lotAreaSqm !== undefined) updateData.lot_area_sqm = validated.lotAreaSqm
    if (validated.locationId) updateData.location_id = validated.locationId
    if (validated.addressLine !== undefined) updateData.address_line = validated.addressLine

    // Update listing
    const { data: updatedListing, error: updateError } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) throw updateError

    // Update PostGIS point if coordinates provided
    if (validated.latitude && validated.longitude) {
      await supabase.rpc('update_listing_geom', {
        listing_id: updatedListing.id,
        lng: validated.longitude,
        lat: validated.latitude,
      })
    }

    return NextResponse.json({ listing: transformListing(updatedListing) })
  } catch (error: any) {
    console.error('Error updating listing:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
