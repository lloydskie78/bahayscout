import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default async function AdminReportsPage() {
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

  const { data: reports, error: reportsError } = await supabase
    .from('reports')
    .select(`
      *,
      listings!reports_listing_id_fkey (title, slug),
      profiles!reports_reporter_user_id_fkey (display_name)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (reportsError) {
    console.error('Error fetching reports:', reportsError)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports Queue</h1>
      {!reports || reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No open reports.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">Report: {report.reason}</h3>
                  {report.profiles && (
                    <p className="text-sm text-muted-foreground">
                      Reported by: {report.profiles.display_name || 'Unknown'}
                    </p>
                  )}
                </div>
                <Badge variant="outline">{report.status}</Badge>
              </div>
              {report.details && <p className="text-sm mb-2">{report.details}</p>}
              <p className="text-xs text-muted-foreground">
                For: <a href={`/l/${report.listings?.slug}`} className="underline">{report.listings?.title}</a>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {format(new Date(report.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
