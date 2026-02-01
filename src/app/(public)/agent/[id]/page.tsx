import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { ListingCard } from '@/components/search/ListingCard'
import { Badge } from '@/components/ui/badge'
import { transformListing } from '@/lib/supabase/db'

interface AgentPageProps {
  params: { id: string }
}

export default async function AgentPage({ params }: AgentPageProps) {
  const supabase = await createServerSupabase()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select(`
      *,
      locations!location_id (*),
      listing_photos (id, storage_path, sort_order),
      profiles!owner_id (display_name, is_verified)
    `)
    .eq('owner_id', profile.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (listingsError) {
    console.error('Error fetching listings:', listingsError)
  }

  const transformedListings = listings?.map(transformListing) || []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {profile.display_name || 'Property Agent'}
          </h1>
          {profile.is_verified && (
            <Badge variant="outline" className="mb-4">
              ✓ Verified Agent
            </Badge>
          )}
          {profile.phone && (
            <p className="text-muted-foreground">Phone: {profile.phone}</p>
          )}
        </div>

        <h2 className="text-2xl font-semibold mb-6">Listings ({transformedListings.length})</h2>
        {transformedListings.length === 0 ? (
          <p className="text-muted-foreground">No published listings yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
