import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatting'

export default async function MyListingsPage() {
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

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select(`
      *,
      locations!location_id (*),
      listing_photos (id, storage_path, sort_order)
    `)
    .eq('owner_id', profile.id)
    .order('created_at', { ascending: false })

  if (listingsError) {
    console.error('Error fetching listings:', listingsError)
    return <div>Error loading listings</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link href="/dashboard/listings/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Button>
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven&apos;t created any listings yet.</p>
          <Link href="/dashboard/listings/new">
            <Button>Create Your First Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Link href={`/l/${listing.slug}`}>
                      <h3 className="text-lg font-semibold hover:underline">{listing.title}</h3>
                    </Link>
                    <Badge
                      variant={
                        listing.status === 'published'
                          ? 'default'
                          : listing.status === 'pending'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    {formatCurrency(listing.price_php)}
                    {listing.category === 'rent' && listing.price_period
                      ? `/${listing.price_period}`
                      : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {listing.locations?.city_municipality}, {listing.locations?.province}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/listings/${listing.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {listing.status === 'draft' && (
                    <form action={`/api/listings/${listing.id}/submit`} method="post">
                      <Button type="submit" size="sm">
                        Submit for Approval
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
