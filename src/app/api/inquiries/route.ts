import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createServiceRoleClient } from '@/lib/supabase/server'
import { resend } from '@/lib/email/resend'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()
    const { listingId, name, email, phone, message } = body

    if (!listingId || !name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify listing exists and is published
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select(`
        *,
        profiles!owner_id (user_id, display_name),
        locations!location_id (*)
      `)
      .eq('id', listingId)
      .single()

    if (listingError || !listing || listing.status !== 'published') {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Get profile id if user is logged in
    let fromUserId = null
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      fromUserId = profile?.id || null
    }

    // Create inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .insert({
        listing_id: listingId,
        from_user_id: fromUserId,
        name,
        email,
        phone: phone || null,
        message,
      })
      .select()
      .single()

    if (inquiryError) throw inquiryError

    // Send emails
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const listingUrl = `${siteUrl}/l/${listing.slug}`

    try {
      // Email to lister (get email from auth.users via service role)
      const serviceClient = createServiceRoleClient()
      let ownerEmail: string | undefined

      try {
        const ownerAuth = await serviceClient.auth.admin.getUserById(listing.profiles?.user_id)
        ownerEmail = ownerAuth.data.user?.email
      } catch (err) {
        console.error('Error fetching owner email:', err)
      }

      if (ownerEmail) {
        await resend.emails.send({
          from: 'BahayScout <noreply@bahayscout.ph>',
          to: ownerEmail,
          subject: `New Inquiry for ${listing.title}`,
          html: `
            <h2>New Inquiry for ${listing.title}</h2>
            <p>You have received a new inquiry for your property listing.</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>From:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p><a href="${listingUrl}">View Listing →</a></p>
          `,
        })
      }

      // Confirmation email to inquirer
      await resend.emails.send({
        from: 'BahayScout <noreply@bahayscout.ph>',
        to: email,
        subject: `Inquiry Sent: ${listing.title}`,
        html: `
          <h2>Inquiry Sent Successfully</h2>
          <p>Thank you for your interest in <strong>${listing.title}</strong>.</p>
          <p>We have sent your message to the property owner/agent. They should get back to you soon.</p>
          <p><a href="${listingUrl}">View Listing →</a></p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">BahayScout.ph - Hanap-bahay, mabilis.</p>
        `,
      })
    } catch (emailError) {
      console.error('Error sending emails:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ inquiry })
  } catch (error: any) {
    console.error('Error creating inquiry:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
