import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { transformListing } from '@/lib/supabase/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
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
      .eq('slug', params.slug)
      .single()

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Only allow viewing published listings
    if (listing.status !== 'published') {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json(transformListing(listing))
  } catch (error: any) {
    console.error('Error fetching listing:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
