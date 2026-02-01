'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClientSupabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'buyer' | 'lister'>('buyer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClientSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'signup') {
        // Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
              phone,
              role,
            },
            // Skip email confirmation for immediate login
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        })

        if (authError) throw authError

        if (authData.user) {
          // Create profile via API
          const response = await fetch('/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: authData.user.id,
              displayName,
              phone,
              role,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to create profile')
          }

          // Check if user is already confirmed (email confirmation disabled in Supabase)
          // or if session exists (auto-confirm enabled)
          if (authData.session) {
            // User is automatically logged in, redirect to dashboard
            window.location.href = '/dashboard'
          } else {
            // Email confirmation is required
            setMessage('Account created! Please check your email to verify your account, then login.')
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Enter your credentials to access your account'
            : 'Create an account to start listing or searching properties'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Juan Dela Cruz"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+63 917 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">I want to</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'buyer' | 'lister')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="buyer">Search/Buy Properties</option>
                  <option value="lister">List Properties</option>
                </select>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {mode === 'signup' && (
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            )}
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
              {message}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-6">
        {mode === 'login' ? (
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
