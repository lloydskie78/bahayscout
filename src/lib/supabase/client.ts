import { createBrowserClient } from '@supabase/ssr'

export function createClientSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      url: supabaseUrl ? 'SET' : 'MISSING',
      key: supabaseKey ? 'SET' : 'MISSING',
    })
    throw new Error(
      'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
