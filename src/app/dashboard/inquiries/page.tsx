import { createServerSupabase } from '@/lib/supabase/server'
import { format } from 'date-fns'

export default async function InquiriesPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Unauthorized</div>
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    return <div>Profile not found</div>
  }

  // Get listings owned by this user
  const { data: listings } = await supabase
    .from('listings')
    .select('id')
    .eq('owner_id', profile.id)

  const listingIds = listings?.map((l) => l.id) || []

  // Get inquiries for those listings
  const { data: inquiries, error: inquiriesError } = await supabase
    .from('inquiries')
    .select(`
      *,
      listings!listing_id (title, slug)
    `)
    .in('listing_id', listingIds.length > 0 ? listingIds : [''])
    .order('created_at', { ascending: false })

  if (inquiriesError) {
    console.error('Error fetching inquiries:', inquiriesError)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Inquiries</h1>
      {!inquiries || inquiries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{inquiry.name}</h3>
                  <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                  {inquiry.phone && <p className="text-sm text-muted-foreground">{inquiry.phone}</p>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              <p className="text-sm mb-2">{inquiry.message}</p>
              <p className="text-xs text-muted-foreground">
                For: <a href={`/l/${inquiry.listings?.slug}`} className="underline">{inquiry.listings?.title}</a>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
