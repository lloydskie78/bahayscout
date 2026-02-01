import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export default async function AdminUsersPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (usersError) {
    console.error('Error fetching users:', usersError)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="space-y-4">
        {users?.map((userProfile) => (
          <div key={userProfile.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{userProfile.display_name || 'No name'}</h3>
                <p className="text-sm text-muted-foreground">ID: {userProfile.user_id}</p>
                <p className="text-sm text-muted-foreground">Phone: {userProfile.phone || 'Not set'}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={userProfile.role === 'admin' ? 'default' : 'secondary'}>
                  {userProfile.role}
                </Badge>
                {userProfile.is_verified && (
                  <Badge variant="outline">Verified</Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
