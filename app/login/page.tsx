'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // We use the client-side approach here for smoother UI feedback,
    // though Server Actions are also completely fine!
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh() // important to trigger SSR layout renders
    }
  }

  return (
    <div className="flex h-[80vh] items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-surface-border)] shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-brand)]/10 mb-4">
            <span className="text-[var(--color-brand)] text-xl font-bold">B</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Welcome Back</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1.5">Please sign in to access your finances.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] mb-1 uppercase">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-surface-border)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] disabled:opacity-50"
              placeholder="you@agency.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] mb-1 uppercase">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-surface-border)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--color-brand)] text-black py-2.5 rounded-lg font-bold hover:bg-[var(--color-brand-light)] transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
