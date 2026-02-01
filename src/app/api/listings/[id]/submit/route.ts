import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { transformListing } from '@/lib/supabase/db'

export async function POST(
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
      .select('*')
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

    if (profileError || !profile || profile.id !== listing.owner_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only allow draft -> pending transition
    if (listing.status !== 'draft') {
      return NextResponse.json(
        { error: `Cannot submit listing with status: ${listing.status}` },
        { status: 400 }
      )
    }

    // Update status to pending
    const { data: updatedListing, error: updateError } = await supabase
      .from('listings')
      .update({ status: 'pending' })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ listing: transformListing(updatedListing) })
  } catch (error: any) {
    console.error('Error submitting listing:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
