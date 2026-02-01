'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'

// Dynamically import MapView with SSR disabled (Leaflet requires window)
const MapView = dynamic(() => import('@/components/map/MapView').then(mod => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full flex items-center justify-center bg-muted rounded-lg">
      Loading map...
    </div>
  )
})

interface ListingMapSectionProps {
  listing: {
    id: string
    slug: string
    title: string
    pricePhp: number | bigint
    category: string
    geom: { type: string; coordinates: [number, number] } | null
  }
}

export function ListingMapSection({ listing }: ListingMapSectionProps) {
  if (!listing.geom) return null

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Location</h2>
        <div className="h-96 rounded-lg overflow-hidden">
          <MapView
            listings={[
              {
                id: listing.id,
                slug: listing.slug,
                title: listing.title,
                pricePhp: listing.pricePhp,
                category: listing.category,
                geom: listing.geom,
              },
            ]}
            center={
              listing.geom?.coordinates
                ? [listing.geom.coordinates[1], listing.geom.coordinates[0]]
                : undefined
            }
            zoom={15}
          />
        </div>
      </CardContent>
    </Card>
  )
}
