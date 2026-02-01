import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()
    const { listingId, reason, details } = body

    if (!listingId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify listing exists
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Get reporter profile id if logged in
    let reporterUserId = null
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      reporterUserId = profile?.id || null
    }

    // Create report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        listing_id: listingId,
        reporter_user_id: reporterUserId,
        reason,
        details: details || null,
      })
      .select()
      .single()

    if (reportError) throw reportError

    return NextResponse.json({ report }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
