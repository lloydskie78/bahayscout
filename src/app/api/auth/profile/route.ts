import { createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { transformProfile } from '@/lib/supabase/db'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, displayName, phone, role } = body

    // Verify the userId matches the authenticated user
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        display_name: displayName,
        phone,
        role: role || 'buyer',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ profile: transformProfile(profile) })
  } catch (error: any) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
