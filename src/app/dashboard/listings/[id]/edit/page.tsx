'use client'

export default function EditListingPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Listing</h1>
      <div className="bg-muted p-8 rounded-lg text-center">
        <p className="text-muted-foreground mb-4">
          Listing edit form coming soon. For now, use the API directly.
        </p>
      </div>
    </div>
  )
}
