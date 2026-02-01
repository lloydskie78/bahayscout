'use client'

export default function NewListingPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Listing</h1>
      <div className="bg-muted p-8 rounded-lg text-center">
        <p className="text-muted-foreground mb-4">
          Listing creation wizard coming soon. For now, use the API directly.
        </p>
        <p className="text-sm text-muted-foreground">
          This will be a multi-step form with: Basics → Location → Details → Pricing → Photos → Review
        </p>
      </div>
    </div>
  )
}
