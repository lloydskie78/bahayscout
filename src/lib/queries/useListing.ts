import { useQuery } from '@tanstack/react-query'

export function useListing(slug: string) {
  return useQuery({
    queryKey: ['listing', slug],
    queryFn: async () => {
      const response = await fetch(`/api/listings/slug/${slug}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Listing not found')
        }
        throw new Error('Failed to fetch listing')
      }
      return response.json()
    },
    enabled: !!slug,
  })
}
