-- BahayScout.ph Database Schema
-- Run this in your Supabase SQL Editor to create all tables

-- Enable PostGIS extension for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'buyer',
    display_name TEXT,
    phone TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id BIGSERIAL PRIMARY KEY,
    region TEXT NOT NULL,
    province TEXT NOT NULL,
    city_municipality TEXT NOT NULL,
    barangay TEXT,
    postal_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_region_province_city ON locations(region, province, city_municipality);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft',
    category TEXT NOT NULL,
    property_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price_php BIGINT NOT NULL,
    price_period TEXT,
    bedrooms INTEGER,
    bathrooms INTEGER,
    floor_area_sqm DECIMAL(10, 2),
    lot_area_sqm DECIMAL(10, 2),
    location_id BIGINT NOT NULL REFERENCES locations(id),
    address_line TEXT,
    geom GEOGRAPHY(Point, 4326),
    search_tsv TSVECTOR,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON listings(property_type);
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_location_id ON listings(location_id);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON listings(slug);
CREATE INDEX IF NOT EXISTS idx_listings_geom ON listings USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_listings_search_tsv ON listings USING GIN(search_tsv);

-- Create listing_photos table
CREATE TABLE IF NOT EXISTS listing_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_photos_listing_sort ON listing_photos(listing_id, sort_order);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_listing_id ON inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_from_user_id ON inquiries(from_user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    reporter_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Function to update search_tsv on listing changes
CREATE OR REPLACE FUNCTION update_listing_search_tsv()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_tsv :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE((SELECT city_municipality || ' ' || province || ' ' || region FROM locations WHERE id = NEW.location_id), '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.property_type, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search_tsv
DROP TRIGGER IF EXISTS listing_search_tsv_update ON listings;
CREATE TRIGGER listing_search_tsv_update
    BEFORE INSERT OR UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_search_tsv();

-- Function to update listing geometry (for PostGIS)
CREATE OR REPLACE FUNCTION update_listing_geom(listing_id uuid, lng float, lat float)
RETURNS void AS $$
BEGIN
    UPDATE listings
    SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_listing_photos_updated_at ON listing_photos;
CREATE TRIGGER update_listing_photos_updated_at
    BEFORE UPDATE ON listing_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inquiries_updated_at ON inquiries;
CREATE TRIGGER update_inquiries_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
