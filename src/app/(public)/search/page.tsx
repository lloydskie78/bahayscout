'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useListings } from '@/lib/queries/useListings'
import { useSearchStore } from '@/lib/stores/searchStore'
import { parseFilters } from '@/lib/utils/filters'
import { ListingCard } from '@/components/search/ListingCard'
import { SearchFilters } from '@/components/search/SearchFilters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, List, Map } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import MapView with SSR disabled (Leaflet requires window)
const MapView = dynamic(() => import('@/components/map/MapView').then(mod => mod.MapView), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">Loading map...</div>
})

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { filters, viewMode, setFilters, setViewMode } = useSearchStore()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(1)

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters = parseFilters(searchParams)
    setFilters(urlFilters)
    if (urlFilters.search) {
      setSearchTerm(urlFilters.search)
    }
  }, [searchParams, setFilters])

  const currentFilters = { ...filters, search: searchTerm || undefined }
  const { data, isLoading, error } = useListings(currentFilters, page, 20)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value))
      }
    })
    router.push(`/search?${params.toString()}`)
    setPage(1)
  }

  const handleBoundsChange = (bounds: { north: number; south: number; east: number; west: number }) => {
    // TODO: Implement map bounds filtering
    console.log('Map bounds changed:', bounds)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by city, barangay, or property name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <SearchFilters filters={filters} onFiltersChange={setFilters} onReset={() => setFilters({})} />
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">
            {data?.pagination.total ? (
              <>
                Showing {data.pagination.total} {data.pagination.total === 1 ? 'listing' : 'listings'}
              </>
            ) : (
              'No listings found'
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <Map className="h-4 w-4 mr-2" />
              Map
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading && <div className="text-center py-12">Loading listings...</div>}
        {error && <div className="text-center py-12 text-destructive">Error loading listings</div>}
        {data && !isLoading && (
          <>
            {viewMode === 'list' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {data.listings.map((listing: any) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                {data.pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {page} of {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page >= data.pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="h-[600px] mb-8">
                <MapView
                  listings={data.listings}
                  onBoundsChange={handleBoundsChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
