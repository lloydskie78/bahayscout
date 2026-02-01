import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/formatting'

export default async function AdminListingsPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: pendingListings, error: listingsError } = await supabase
    .from('listings')
    .select(`
      *,
      profiles!owner_id (display_name, is_verified),
      locations!location_id (*)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (listingsError) {
    console.error('Error fetching listings:', listingsError)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Approval Queue</h1>
      {!pendingListings || pendingListings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No pending listings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingListings.map((listing) => (
            <div key={listing.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{listing.title}</h3>
                    <Badge variant="secondary">{listing.status}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    {formatCurrency(listing.price_php)}
                    {listing.category === 'rent' && listing.price_period
                      ? `/${listing.price_period}`
                      : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    By: {listing.profiles?.display_name || 'Unknown'}
                    {listing.profiles?.is_verified && (
                      <Badge variant="outline" className="ml-2 text-xs">Verified</Badge>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {listing.locations?.city_municipality}, {listing.locations?.province}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={`/api/admin/listings/${listing.id}/approve`} method="post">
                    <Button type="submit" size="sm">
                      Approve
                    </Button>
                  </form>
                  <form action={`/api/admin/listings/${listing.id}/reject`} method="post">
                    <Button type="submit" variant="destructive" size="sm">
                      Reject
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
