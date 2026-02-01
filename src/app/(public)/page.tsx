import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            BahayScout.ph
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Hanap-bahay, mabilis.
          </p>
          
          {/* Search Bar */}
          <form action="/search" method="get" className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  name="search"
                  type="text"
                  placeholder="Search by city, barangay, or property name..."
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8">
                Search
              </Button>
            </div>
          </form>

          {/* Quick Links */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/search?category=sale">
              <Button variant="outline">For Sale</Button>
            </Link>
            <Link href="/search?category=rent">
              <Button variant="outline">For Rent</Button>
            </Link>
            <Link href="/search?propertyType=condo">
              <Button variant="outline">Condos</Button>
            </Link>
            <Link href="/search?propertyType=house_lot">
              <Button variant="outline">House & Lot</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose BahayScout?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Fast Search</h3>
              <p className="text-muted-foreground">
                Find properties quickly by location, price, and type with our powerful search filters.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
              <p className="text-muted-foreground">
                All listings are verified by our team to ensure accuracy and trust.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-semibold mb-2">Easy Inquiry</h3>
              <p className="text-muted-foreground">
                Contact property owners and agents directly through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find your perfect property?</h2>
          <p className="text-muted-foreground mb-8">
            Start searching now or list your property to reach thousands of potential buyers and renters.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/search">
              <Button size="lg">Browse Properties</Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">List Your Property</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
