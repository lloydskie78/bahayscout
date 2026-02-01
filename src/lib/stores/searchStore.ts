import { create } from 'zustand'
import { type ListingFilters } from '@/lib/utils/filters'

interface SearchState {
  filters: ListingFilters
  viewMode: 'list' | 'map'
  setFilters: (filters: Partial<ListingFilters>) => void
  setViewMode: (mode: 'list' | 'map') => void
  resetFilters: () => void
}

const initialFilters: ListingFilters = {}

export const useSearchStore = create<SearchState>((set) => ({
  filters: initialFilters,
  viewMode: 'list',
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  setViewMode: (mode) => set({ viewMode: mode }),
  resetFilters: () => set({ filters: initialFilters }),
}))
