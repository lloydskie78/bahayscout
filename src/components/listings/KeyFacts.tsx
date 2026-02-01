import { formatCurrency, formatPropertyType, formatArea } from '@/lib/utils/formatting'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bed, Bath, Square, MapPin } from 'lucide-react'

interface KeyFactsProps {
  listing: {
    category: string
    propertyType: string
    pricePhp: number | bigint
    pricePeriod?: string | null
    bedrooms?: number | null
    bathrooms?: number | null
    floorAreaSqm?: number | null
    lotAreaSqm?: number | null
    location: {
      addressLine?: string | null
      barangay?: string | null
      cityMunicipality: string
      province: string
      region: string
    }
  }
}

export function KeyFacts({ listing }: KeyFactsProps) {
  const priceDisplay = listing.category === 'rent' && listing.pricePeriod
    ? `${formatCurrency(listing.pricePhp)}/${listing.pricePeriod}`
    : formatCurrency(listing.pricePhp)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-3xl font-bold">{priceDisplay}</h2>
              <Badge variant={listing.category === 'sale' ? 'default' : 'outline'}>
                {listing.category === 'sale' ? 'For Sale' : 'For Rent'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{formatPropertyType(listing.propertyType)}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            {listing.bedrooms !== null && listing.bedrooms !== undefined && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Bed className="h-4 w-4" />
                  <span className="text-sm">Bedrooms</span>
                </div>
                <p className="text-lg font-semibold">{listing.bedrooms}</p>
              </div>
            )}
            {listing.bathrooms !== null && listing.bathrooms !== undefined && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Bath className="h-4 w-4" />
                  <span className="text-sm">Bathrooms</span>
                </div>
                <p className="text-lg font-semibold">{listing.bathrooms}</p>
              </div>
            )}
            {listing.floorAreaSqm && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Square className="h-4 w-4" />
                  <span className="text-sm">Floor Area</span>
                </div>
                <p className="text-lg font-semibold">{formatArea(Number(listing.floorAreaSqm))}</p>
              </div>
            )}
            {listing.lotAreaSqm && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Square className="h-4 w-4" />
                  <span className="text-sm">Lot Area</span>
                </div>
                <p className="text-lg font-semibold">{formatArea(Number(listing.lotAreaSqm))}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-muted-foreground">
                  {[
                    listing.location.addressLine,
                    listing.location.barangay,
                    listing.location.cityMunicipality,
                    listing.location.province,
                    listing.location.region,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
