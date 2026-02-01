-- RLS Policies for BahayScout.ph
-- Run this in your Supabase SQL editor after creating the tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

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
    auth.uid()::text IN (
      SELECT user_id::text FROM profiles WHERE id = owner_id
    )
  );

-- Admins can read all listings
CREATE POLICY "Admins can view all listings" ON listings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Authenticated users with lister role can insert listings
CREATE POLICY "Listers can create listings" ON listings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
      AND (role = 'lister' OR role = 'admin')
    )
    AND owner_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()::text
    )
  );

-- Owners can update their own listings
CREATE POLICY "Owners can update own listings" ON listings
  FOR UPDATE
  USING (
    auth.uid()::text IN (
      SELECT user_id::text FROM profiles WHERE id = owner_id
    )
  );

-- Admins can update any listing
CREATE POLICY "Admins can update any listing" ON listings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
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
      WHERE listings.id = listing_photos.listing_id
      AND auth.uid()::text IN (
        SELECT user_id::text FROM profiles WHERE id = listings.owner_id
      )
    )
  );

-- Owners can insert photos for their own listings
CREATE POLICY "Owners can upload own listing photos" ON listing_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_photos.listing_id
      AND auth.uid()::text IN (
        SELECT user_id::text FROM profiles WHERE id = listings.owner_id
      )
    )
  );

-- Favorites policies
-- Users can read their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Users can insert their own favorites
CREATE POLICY "Users can create own favorites" ON favorites
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

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
      WHERE listings.id = inquiries.listing_id
      AND auth.uid()::text IN (
        SELECT user_id::text FROM profiles WHERE id = listings.owner_id
      )
    )
  );

-- Users can read their own inquiries
CREATE POLICY "Users can view own inquiries" ON inquiries
  FOR SELECT
  USING (
    from_user_id IS NOT NULL
    AND auth.uid()::text = from_user_id::text
  );

-- Admins can read all inquiries
CREATE POLICY "Admins can view all inquiries" ON inquiries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
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
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Users can read their own reports
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT
  USING (
    reporter_user_id IS NOT NULL
    AND auth.uid()::text = reporter_user_id::text
  );

-- Admins can update reports
CREATE POLICY "Admins can update reports" ON reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
    )
  );
