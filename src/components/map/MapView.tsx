'use client'

import { useEffect, useState } from 'react'

interface MapViewProps {
  listings: Array<{
    id: string
    slug: string
    title: string
    pricePhp: number | bigint
    category: string
    geom?: { type: string; coordinates: [number, number] } | null
  }>
  center?: [number, number]
  zoom?: number
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void
}

export function MapView({ listings, center = [14.5995, 120.9842], zoom = 11, onBoundsChange }: MapViewProps) {
  const [MapComponents, setMapComponents] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)

  // Dynamically load Leaflet and react-leaflet only on client
  useEffect(() => {
    const loadMap = async () => {
      // Import Leaflet and react-leaflet
      const L = (await import('leaflet')).default
      const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet')
      
      // Fix for default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      
      setMapComponents({ MapContainer, TileLayer, Marker, Popup, L })
      setIsReady(true)
    }
    
    loadMap()
  }, [])

  const formatCurrency = (amount: number | bigint) => {
    const num = typeof amount === 'bigint' ? Number(amount) : amount
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  if (!isReady || !MapComponents) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        Loading map...
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings
          .filter((listing) => listing.geom?.coordinates)
          .map((listing) => {
            const coords = listing.geom!.coordinates
            return (
              <Marker key={listing.id} position={[coords[1], coords[0]]}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-1">{listing.title}</h3>
                    <p className="text-xs text-muted-foreground mb-1">
                      {formatCurrency(listing.pricePhp)}
                      {listing.category === 'rent' ? '/month' : ''}
                    </p>
                    <a
                      href={`/l/${listing.slug}`}
                      className="text-xs text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Details →
                    </a>
                  </div>
                </Popup>
              </Marker>
            )
          })}
      </MapContainer>
    </div>
  )
}
