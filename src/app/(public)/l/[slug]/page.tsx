import { notFound } from 'next/navigation'
import { PhotoCarousel } from '@/components/listings/PhotoCarousel'
import { KeyFacts } from '@/components/listings/KeyFacts'
import { InquiryForm } from '@/components/listings/InquiryForm'
import { ReportButton } from '@/components/listings/ReportButton'
import { ListingMapSection } from '@/components/map/ListingMapSection'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface ListingDetailPageProps {
  params: { slug: string }
}

async function getListing(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/listings/slug/${slug}`, {
      cache: 'no-store',
    })
    if (!response.ok) {
      return null
    }
    return response.json()
  } catch {
    return null
  }
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const listing = await getListing(params.slug)

  if (!listing) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Link href="/search">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos */}
            <PhotoCarousel photos={listing.photos} title={listing.title} />

            {/* Key Facts */}
            <KeyFacts listing={listing} />

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{listing.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <ListingMapSection listing={listing} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Inquiry Form */}
            <InquiryForm listingId={listing.id} listingTitle={listing.title} />

            {/* Agent Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Listed by</h3>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{listing.owner.displayName || 'Property Owner'}</p>
                  {listing.owner.isVerified && (
                    <Badge variant="outline" className="text-xs">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <Link href={`/agent/${listing.owner.id}`}>
                  <Button variant="outline" className="w-full mt-4">
                    View Profile
                  </Button>
                </Link>
                <div className="mt-4 pt-4 border-t">
                  <ReportButton listingId={listing.id} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
