'use client'

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const search = useSearchParams();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      const extract = (d) => d?.detail?.detail || d?.detail || d?.error || d?.message;
      if (!res.ok) throw new Error(extract(data) || 'Login failed');
      toast.success('Signed in');
      const next = search.get('next') || '/';
      router.replace(next);
    } catch (err) {
      toast.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-foreground/5">
      <div className="w-full max-w-md mx-4 stagger-container">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
            ErgoTask AI
          </h1>
          <p className="text-foreground/60">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="card p-8 space-y-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <Input 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-background border-border text-foreground placeholder:text-foreground/50"
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-background border-border text-foreground placeholder:text-foreground/50"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="text-center text-sm">
            <span className="text-foreground/60 mr-2">New here?</span>
            <a href="/signup" className="inline-block px-3 py-1 rounded-md bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 text-green-700 dark:text-green-300 hover:opacity-80">Create an account</a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-foreground/40">
            Prepared for ErgoSphere by Mumin Bhat
          </p>
        </div>
      </div>
    </div>
  );
}
