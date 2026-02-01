import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Profile Information</h2>
          <p className="text-sm text-muted-foreground">Display Name: {profile?.display_name || 'Not set'}</p>
          <p className="text-sm text-muted-foreground">Phone: {profile?.phone || 'Not set'}</p>
          <p className="text-sm text-muted-foreground">Role: {profile?.role}</p>
          <p className="text-sm text-muted-foreground">
            Verified: {profile?.is_verified ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    </div>
  )
}
