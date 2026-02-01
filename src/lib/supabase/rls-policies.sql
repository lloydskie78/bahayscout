-- RLS Policies for BahayScout.ph
-- Run this in your Supabase SQL editor after creating the tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Published listings are viewable" ON listings;
DROP POLICY IF EXISTS "Owners can view own listings" ON listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Listers can create listings" ON listings;
DROP POLICY IF EXISTS "Owners can update own listings" ON listings;
DROP POLICY IF EXISTS "Admins can update any listing" ON listings;
DROP POLICY IF EXISTS "Published listing photos are viewable" ON listing_photos;
DROP POLICY IF EXISTS "Owners can view own listing photos" ON listing_photos;
DROP POLICY IF EXISTS "Owners can upload own listing photos" ON listing_photos;
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
DROP POLICY IF EXISTS "Anyone can create inquiries" ON inquiries;
DROP POLICY IF EXISTS "Listing owners can view inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can view own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON inquiries;
DROP POLICY IF EXISTS "Anyone can create reports" ON reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;

-- Profiles policies
-- Public can read display_name and is_verified
CREATE POLICY "Public profiles are viewable" ON profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Listings policies
-- Public can read published listings
CREATE POLICY "Published listings are viewable" ON listings
  FOR SELECT
  USING (status = 'published');

-- Owners can read their own listings (any status)
CREATE POLICY "Owners can view own listings" ON listings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = listings.owner_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Admins can read all listings
CREATE POLICY "Admins can view all listings" ON listings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Authenticated users with lister role can insert listings
CREATE POLICY "Listers can create listings" ON listings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND (role = 'lister' OR role = 'admin')
    )
    AND owner_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Owners can update their own listings
CREATE POLICY "Owners can update own listings" ON listings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = listings.owner_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Admins can update any listing
CREATE POLICY "Admins can update any listing" ON listings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Listing photos policies
-- Public can read photos for published listings
CREATE POLICY "Published listing photos are viewable" ON listing_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_photos.listing_id
      AND listings.status = 'published'
    )
  );

-- Owners can read photos for their own listings
CREATE POLICY "Owners can view own listing photos" ON listing_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      JOIN profiles ON profiles.id = listings.owner_id
      WHERE listings.id = listing_photos.listing_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Owners can insert photos for their own listings
CREATE POLICY "Owners can upload own listing photos" ON listing_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      JOIN profiles ON profiles.id = listings.owner_id
      WHERE listings.id = listing_photos.listing_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Favorites policies
-- Users can read their own favorites
-- Note: favorites.user_id references profiles.id, so we need to join to get the actual user_id
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = favorites.user_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Users can insert their own favorites
CREATE POLICY "Users can create own favorites" ON favorites
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = favorites.user_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = favorites.user_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Inquiries policies
-- Anyone can create inquiries (public insert)
CREATE POLICY "Anyone can create inquiries" ON inquiries
  FOR INSERT
  WITH CHECK (true);

-- Listing owners can read inquiries for their listings
CREATE POLICY "Listing owners can view inquiries" ON inquiries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      JOIN profiles ON profiles.id = listings.owner_id
      WHERE listings.id = inquiries.listing_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Users can read their own inquiries
-- Note: inquiries.from_user_id references profiles.id, so we need to join
CREATE POLICY "Users can view own inquiries" ON inquiries
  FOR SELECT
  USING (
    from_user_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = inquiries.from_user_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Admins can read all inquiries
CREATE POLICY "Admins can view all inquiries" ON inquiries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Reports policies
-- Anyone can create reports (public insert)
CREATE POLICY "Anyone can create reports" ON reports
  FOR INSERT
  WITH CHECK (true);

-- Admins can read all reports
CREATE POLICY "Admins can view all reports" ON reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Users can read their own reports
-- Note: reports.reporter_user_id references profiles.id, so we need to join
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT
  USING (
    reporter_user_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = reports.reporter_user_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Admins can update reports
CREATE POLICY "Admins can update reports" ON reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
