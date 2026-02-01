# BahayScout.ph

**Tagline:** "Hanap-bahay, mabilis."

A clean, mobile-first property listings platform for the Philippines focused on fast search, verified listings, and easy inquiry.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Database:** Supabase (PostgreSQL + PostGIS)
- **ORM:** Prisma + Supabase client
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **State:** React Query + Zustand
- **UI:** shadcn/ui + Tailwind CSS
- **Maps:** Leaflet + OpenStreetMap
- **Email:** Resend
- **Testing:** Jest + Playwright
- **Deployment:** Vercel

## Setup

### Option 1: Local Development (without Docker)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
   - `DATABASE_URL` - PostgreSQL connection string
   - `DIRECT_URL` - Direct PostgreSQL connection (same as DATABASE_URL for Supabase)
   - `RESEND_API_KEY` - Resend API key for emails
   - `NEXT_PUBLIC_SITE_URL` - Your site URL (e.g., http://localhost:3000)

3. **Set up database:**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database (or use migrations)
   npm run db:push

   # Run RLS policies in Supabase SQL editor
   # Copy contents of src/lib/supabase/rls-policies.sql
   ```

4. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

### Option 2: Docker Development

1. **Set up environment variables:**
   Create a `.env` file in the root directory with the same variables as above.

2. **Build and run with Docker Compose:**
   ```bash
   # For development with hot reload
   docker-compose -f docker-compose.dev.yml up --build

   # Or for production build
   docker-compose up --build
   ```

3. **Access the application:**
   - App: http://localhost:3000
   - Database (if using local): localhost:5432

4. **Run database migrations:**
   ```bash
   # If using local database, run migrations inside container
   docker-compose exec app npm run db:push
   docker-compose exec app npm run db:migrate
   ```

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
     -e DATABASE_URL=your_db_url \
     -e DIRECT_URL=your_db_url \
     -e RESEND_API_KEY=your_key \
     -e NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
     bahayscout:latest
   ```

   Or use a `.env` file:
   ```bash
   docker run -p 3000:3000 --env-file .env bahayscout:latest
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
│   ├── supabase/          # Supabase clients
│   ├── prisma/             # Prisma client
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

Key tables:
- `profiles` - User profiles with roles
- `locations` - Normalized PH locations
- `listings` - Property listings with PostGIS geography
- `listing_photos` - Photo metadata
- `favorites` - User favorites
- `inquiries` - Lead inquiries
- `reports` - Listing reports

## API Routes

- `GET /api/listings` - Search/filter listings
- `GET /api/listings/[id]` - Get single listing
- `POST /api/listings` - Create listing (lister)
- `PATCH /api/listings/[id]` - Update listing (owner)
- `POST /api/listings/[id]/submit` - Submit for approval
- `POST /api/inquiries` - Create inquiry
- `POST /api/reports` - Report listing
- `POST /api/admin/listings/[id]/approve` - Approve listing (admin)
- `POST /api/admin/listings/[id]/reject` - Reject listing (admin)

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## Docker Commands

```bash
# Build production image
docker build -t bahayscout:latest .

# Run production container
docker run -p 3000:3000 --env-file .env bahayscout:latest

# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Production with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop containers
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Docker Deployment

1. Build the Docker image
2. Push to a container registry (Docker Hub, AWS ECR, etc.)
3. Deploy to your hosting platform (AWS ECS, Google Cloud Run, Azure Container Instances, etc.)
4. Set environment variables in your hosting platform

## License

MIT
