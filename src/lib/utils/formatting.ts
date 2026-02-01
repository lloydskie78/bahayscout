export function formatCurrency(amount: number | bigint): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatAddress(
  addressLine: string | null,
  barangay: string | null,
  city: string,
  province: string,
  region: string
): string {
  const parts: string[] = []

  if (addressLine) parts.push(addressLine)
  if (barangay) parts.push(barangay)
  parts.push(city)
  parts.push(province)
  parts.push(region)

  return parts.join(', ')
}

export function formatPropertyType(type: string): string {
  const types: Record<string, string> = {
    condo: 'Condo',
    house_lot: 'House & Lot',
    townhouse: 'Townhouse',
    lot: 'Lot',
    commercial: 'Commercial',
    apartment: 'Apartment',
    bedspace: 'Bedspace',
  }
  return types[type] || type
}

export function formatArea(area: number | null | undefined): string {
  if (!area) return 'N/A'
  return `${area.toLocaleString('en-PH')} sqm`
}
