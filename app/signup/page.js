'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/sonner'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) })
      const data = await res.json().catch(() => ({}))
      const extract = (d) => d?.username?.[0] || d?.detail?.detail || (typeof d?.detail === 'string' ? d.detail : null) || d?.error || d?.message
      if (!res.ok) throw new Error(extract(data) || 'Signup failed')
      toast.success('Account created')
      router.replace('/')
    } catch (e) {
      toast.error(e?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-foreground/5">
      <div className="w-full max-w-md mx-4 stagger-container">
        <div className="card p-8 space-y-6">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Username</label>
              <Input value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Email (optional)</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button disabled={loading} className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium disabled:opacity-50">
              {loading ? 'Creating…' : 'Sign up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


