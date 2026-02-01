# BahayScout.ph

**Tagline:** "Hanap-bahay, mabilis."

A clean, mobile-first property listings platform for the Philippines focused on fast search, verified listings, and easy inquiry.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Database Client:** Supabase JS Client
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **State:** React Query + Zustand
- **UI:** shadcn/ui + Tailwind CSS
- **Maps:** Leaflet + OpenStreetMap
- **Email:** Resend
- **Testing:** Jest + Playwright
- **Deployment:** Vercel

## Prerequisites

- Node.js 20+ and npm
- A Supabase project (sign up at [supabase.com](https://supabase.com))
- Resend account for email functionality (optional for development)

## Setup

### Option 1: Local Development (without Docker)

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd bahayscout
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   RESEND_API_KEY=your-resend-api-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   You can find these values in your Supabase project settings:
   - Go to Project Settings → API
   - Copy the Project URL and anon/public key
   - Copy the service_role key (keep this secret!)

3. **Set up Supabase database:**
   
   a. **Create tables in Supabase:**
      - Go to your Supabase project dashboard
      - Navigate to SQL Editor
      - Run the SQL in `src/lib/supabase/schema.sql` to create all tables
      - Or use the Supabase Table Editor to create tables manually

   b. **Set up Row Level Security (RLS) policies:**
      - In Supabase SQL Editor, run the contents of `src/lib/supabase/rls-policies.sql`
      - This sets up security policies for your tables

   c. **Create required functions (optional):**
      If you're using PostGIS for location data, create this function in Supabase SQL Editor:
      ```sql
      CREATE OR REPLACE FUNCTION update_listing_geom(listing_id uuid, lng float, lat float)
      RETURNS void AS $$
      BEGIN
        UPDATE listings
        SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        WHERE id = listing_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Open [http://localhost:3000](http://localhost:3000)

### Option 2: Docker Development

1. **Set up environment variables:**
   Create a `.env.local` file in the root directory with the same variables as above.

2. **Build and run with Docker Compose:**
   ```bash
   # For development with hot reload
   docker-compose -f docker-compose.dev.yml up --build

   # Or for production build
   docker-compose up --build
   ```

3. **Access the application:**
   - App: http://localhost:3000

### Option 3: Docker Production Build

1. **Build the Docker image:**
   ```bash
   docker build -t bahayscout:latest .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=your_url \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
     -e SUPABASE_SERVICE_ROLE_KEY=your_key \
     -e RESEND_API_KEY=your_key \
     -e NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
     bahayscout:latest
   ```

   Or use a `.env.local` file:
   ```bash
   docker run -p 3000:3000 --env-file .env.local bahayscout:latest
   ```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Public routes
│   ├── (auth)/             # Auth routes
│   ├── dashboard/          # Authenticated routes
│   ├── admin/              # Admin routes
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                 # shadcn components
│   ├── listings/
│   ├── search/
│   └── map/
├── lib/                    # Utilities and configs
│   ├── supabase/          # Supabase clients and helpers
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server client
│   │   ├── middleware.ts  # Auth middleware
│   │   ├── db.ts          # Database helpers and types
│   │   └── rls-policies.sql # RLS policies
│   ├── queries/            # React Query hooks
│   ├── stores/             # Zustand stores
│   └── utils/              # Utilities
└── types/                  # TypeScript types
```

## Features

### MVP Features

- ✅ Public search + browse listings (filters + text search)
- ✅ Listing detail page with gallery, map, agent profile, inquiry CTA
- ✅ Authenticated posting for sellers/agents (create/edit/publish)
- ✅ Moderation (admin can approve/reject/hide)
- ✅ Lead capture (inquiry form → store + email notify)
- ✅ Basic trust layer (verified badge for approved agents, report listing)

### User Roles

- **Guest:** Search, view listings, send inquiry
- **Buyer/Renter:** Save favorites, manage inquiries
- **Lister (Agent/Owner):** Create listings, upload photos, view inquiries
- **Admin/Moderator:** Approve listings, manage reports/users

## Database Schema

The database is managed entirely through Supabase. Key tables:

- `profiles` - User profiles with roles (buyer, lister, admin)
- `locations` - Normalized PH locations (region, province, city, barangay)
- `listings` - Property listings with PostGIS geography for mapping
- `listing_photos` - Photo metadata and storage paths
- `favorites` - User favorites (many-to-many)
- `inquiries` - Lead inquiries from potential buyers
- `reports` - Listing reports for moderation

### Setting up the Database

1. **Create tables in Supabase:**
   - Use the Supabase Table Editor or SQL Editor
   - Run `src/lib/supabase/schema.sql` to create all tables
   - Ensure foreign key relationships are properly set up

2. **Enable PostGIS extension (for location features):**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Set up Row Level Security:**
   - Run the SQL in `src/lib/supabase/rls-policies.sql` in your Supabase SQL Editor
   - This ensures users can only access their own data

## API Routes

- `GET /api/listings` - Search/filter listings
- `GET /api/listings/[id]` - Get single listing
- `GET /api/listings/slug/[slug]` - Get listing by slug
- `POST /api/listings` - Create listing (lister)
- `PATCH /api/listings/[id]` - Update listing (owner)
- `POST /api/listings/[id]/submit` - Submit for approval
- `POST /api/inquiries` - Create inquiry
- `POST /api/reports` - Report listing
- `POST /api/admin/listings/[id]/approve` - Approve listing (admin)
- `POST /api/admin/listings/[id]/reject` - Reject listing (admin)
- `POST /api/auth/profile` - Create user profile
- `POST /api/auth/signout` - Sign out user

## Supabase Configuration

### Foreign Key Relationships

The application uses Supabase's PostgREST foreign key syntax:
- `profiles!owner_id` - Join profiles table via owner_id foreign key
- `locations!location_id` - Join locations table via location_id foreign key
- `listings!listing_id` - Join listings table via listing_id foreign key

Ensure your Supabase foreign keys are properly configured for these relationships to work.

### Storage Buckets

If you're using Supabase Storage for listing photos:
1. Create a storage bucket in Supabase Dashboard
2. Set up bucket policies for public read access
3. Configure CORS if needed

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

## Docker Commands

```bash
# Build production image
docker build -t bahayscout:latest .

# Run production container
docker run -p 3000:3000 --env-file .env.local bahayscout:latest

# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Production with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Environment Variables

Required environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for admin operations) | Yes |
| `RESEND_API_KEY` | Resend API key for sending emails | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (e.g., http://localhost:3000) | Yes |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. Deploy

### Docker Deployment

1. Build the Docker image
2. Push to a container registry (Docker Hub, AWS ECR, etc.)
3. Deploy to your hosting platform (AWS ECS, Google Cloud Run, Azure Container Instances, etc.)
4. Set environment variables in your hosting platform

## Troubleshooting

### Common Issues

1. **"window is not defined" errors:**
   - This is normal during build - Leaflet components are dynamically imported with SSR disabled

2. **Supabase connection errors:**
   - Verify your environment variables are set correctly
   - Check that your Supabase project is active
   - Ensure RLS policies are set up correctly

3. **Foreign key relationship errors:**
   - Verify foreign keys are properly configured in Supabase
   - Check that the relationship syntax matches your database schema

4. **Build errors:**
   - Ensure all environment variables are set (even dummy values for build)
   - Check that all dependencies are installed

## License

MIT
