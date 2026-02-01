import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency, formatPropertyType, formatArea } from '@/lib/utils/formatting'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Bed, Bath, Square } from 'lucide-react'

interface ListingCardProps {
  listing: {
    id: string
    slug: string
    title: string
    category: string
    propertyType: string
    pricePhp: number | bigint
    pricePeriod?: string | null
    bedrooms?: number | null
    bathrooms?: number | null
    floorAreaSqm?: number | null
    lotAreaSqm?: number | null
    location: {
      cityMunicipality: string
      province: string
      barangay?: string | null
    }
    photos: Array<{
      storagePath: string
    }>
    owner: {
      displayName: string | null
      isVerified: boolean
    }
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  const mainPhoto = listing.photos[0]?.storagePath
  const priceDisplay = listing.category === 'rent' && listing.pricePeriod
    ? `${formatCurrency(listing.pricePhp)}/${listing.pricePeriod}`
    : formatCurrency(listing.pricePhp)

  return (
    <Link href={`/l/${listing.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative w-full h-48 bg-gray-200">
          {mainPhoto ? (
            <Image
              src={mainPhoto}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/90">
              {formatPropertyType(listing.propertyType)}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant={listing.category === 'sale' ? 'default' : 'outline'}>
              {listing.category === 'sale' ? 'For Sale' : 'For Rent'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
          <p className="text-2xl font-bold text-primary mb-3">{priceDisplay}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
            {listing.bedrooms !== null && listing.bedrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{listing.bedrooms}</span>
              </div>
            )}
            {listing.bathrooms !== null && listing.bathrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{listing.bathrooms}</span>
              </div>
            )}
            {listing.floorAreaSqm && (
              <div className="flex items-center gap-1">
                <Square className="w-4 h-4" />
                <span>{formatArea(Number(listing.floorAreaSqm))}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">
              {[listing.location.barangay, listing.location.cityMunicipality, listing.location.province]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
          {listing.owner.isVerified && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                ✓ Verified Agent
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
