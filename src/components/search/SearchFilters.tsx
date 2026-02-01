'use client'

import { useState } from 'react'
import { type ListingFilters } from '@/lib/utils/filters'
import { type PropertyType, type ListingCategory } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter } from 'lucide-react'

interface SearchFiltersProps {
  filters: ListingFilters
  onFiltersChange: (filters: Partial<ListingFilters>) => void
  onReset: () => void
}

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'condo', label: 'Condo' },
  { value: 'house_lot', label: 'House & Lot' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'lot', label: 'Lot' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'bedspace', label: 'Bedspace' },
]

export function SearchFilters({ filters, onFiltersChange, onReset }: SearchFiltersProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Listings</SheetTitle>
          <SheetDescription>Refine your search to find the perfect property</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ category: value === 'all' ? undefined : (value as ListingCategory) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Property Type</Label>
            <Select
              value={filters.propertyType || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ propertyType: value === 'all' ? undefined : (value as PropertyType) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Price Range (₱)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) =>
                  onFiltersChange({ minPrice: e.target.value ? parseInt(e.target.value, 10) : undefined })
                }
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) =>
                  onFiltersChange({ maxPrice: e.target.value ? parseInt(e.target.value, 10) : undefined })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <Input
              type="number"
              min="0"
              placeholder="Minimum"
              value={filters.bedrooms || ''}
              onChange={(e) =>
                onFiltersChange({ bedrooms: e.target.value ? parseInt(e.target.value, 10) : undefined })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Bathrooms</Label>
            <Input
              type="number"
              min="0"
              placeholder="Minimum"
              value={filters.bathrooms || ''}
              onChange={(e) =>
                onFiltersChange({ bathrooms: e.target.value ? parseInt(e.target.value, 10) : undefined })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Floor Area (sqm)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minFloorArea || ''}
                onChange={(e) =>
                  onFiltersChange({
                    minFloorArea: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxFloorArea || ''}
                onChange={(e) =>
                  onFiltersChange({
                    maxFloorArea: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={() => setOpen(false)} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
