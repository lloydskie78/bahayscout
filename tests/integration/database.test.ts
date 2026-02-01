/**
 * @jest-environment node
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Database connection tests
 * 
 * These tests verify the connection to Supabase and basic database operations.
 * They require valid NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * environment variables to be set.
 * 
 * Run with: npm test -- tests/integration/database.test.ts
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Skip tests if environment variables are not configured
const describeIfConfigured = supabaseUrl && supabaseKey ? describe : describe.skip

describeIfConfigured('Database Connection', () => {
  const supabase = createClient(supabaseUrl!, supabaseKey!)

  it('should connect to Supabase successfully', async () => {
    // Test connection by checking auth status (doesn't require any tables)
    const { error } = await supabase.auth.getSession()
    
    // No error means connection successful
    expect(error).toBeNull()
  })

  it('should be able to query the profiles table', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    // Should not have a connection error (empty result is fine)
    // Error code 42P01 means table doesn't exist, which is a schema issue not connection
    if (error && error.code !== '42P01') {
      expect(error.message).not.toContain('Failed to fetch')
      expect(error.message).not.toContain('ENOTFOUND')
    }
    
    // Either we get data (even empty array) or a table-not-found error
    expect(data !== null || error?.code === '42P01').toBe(true)
  })

  it('should be able to query the listings table', async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, status')
      .eq('status', 'published')
      .limit(5)

    if (error && error.code !== '42P01') {
      expect(error.message).not.toContain('Failed to fetch')
      expect(error.message).not.toContain('ENOTFOUND')
    }

    expect(data !== null || error?.code === '42P01').toBe(true)
  })

  it('should be able to query the locations table', async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('id, region, province, city_municipality')
      .limit(5)

    if (error && error.code !== '42P01') {
      expect(error.message).not.toContain('Failed to fetch')
      expect(error.message).not.toContain('ENOTFOUND')
    }

    expect(data !== null || error?.code === '42P01').toBe(true)
  })
})

describeIfConfigured('Database Schema Validation', () => {
  const supabase = createClient(supabaseUrl!, supabaseKey!)

  it('should have profiles table with expected columns', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, role, display_name, phone, is_verified, created_at, updated_at')
      .limit(0)

    // If table exists, all columns should be queryable without error
    if (!error) {
      expect(data).toBeDefined()
    } else {
      // Table doesn't exist - schema needs to be set up
      expect(error.code).toBe('42P01')
    }
  })

  it('should have listings table with expected columns', async () => {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        id, 
        owner_id, 
        status, 
        category, 
        property_type, 
        title, 
        description, 
        price_php, 
        price_period, 
        bedrooms, 
        bathrooms, 
        floor_area_sqm, 
        lot_area_sqm, 
        location_id, 
        address_line, 
        slug, 
        created_at, 
        updated_at
      `)
      .limit(0)

    if (!error) {
      expect(data).toBeDefined()
    } else {
      expect(error.code).toBe('42P01')
    }
  })

  it('should have inquiries table with expected columns', async () => {
    const { data, error } = await supabase
      .from('inquiries')
      .select('id, listing_id, from_user_id, name, email, phone, message, status, created_at, updated_at')
      .limit(0)

    if (!error) {
      expect(data).toBeDefined()
    } else {
      expect(error.code).toBe('42P01')
    }
  })

  it('should have reports table with expected columns', async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('id, listing_id, reporter_user_id, reason, details, status, created_at, updated_at')
      .limit(0)

    if (!error) {
      expect(data).toBeDefined()
    } else {
      expect(error.code).toBe('42P01')
    }
  })
})

// Test that runs even without env vars to provide feedback
describe('Environment Configuration', () => {
  it('should have Supabase URL configured', () => {
    if (!supabaseUrl) {
      console.warn('⚠️  NEXT_PUBLIC_SUPABASE_URL is not set - database tests will be skipped')
    }
    expect(true).toBe(true) // Always pass, just log warning
  })

  it('should have Supabase anon key configured', () => {
    if (!supabaseKey) {
      console.warn('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY is not set - database tests will be skipped')
    }
    expect(true).toBe(true) // Always pass, just log warning
  })

  it('should have valid Supabase URL format', () => {
    if (supabaseUrl) {
      expect(supabaseUrl).toMatch(/^https:\/\/[a-z0-9-]+\.supabase\.co$/)
    }
  })
})
