'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';

// Container component
export function Container({ children, className = '' }) {
  return <div className={`mx-auto max-w-7xl px-4 ${className}`}>{children}</div>;
}

// Navbar component
export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/60 border-b border-border">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-foreground hover:opacity-80 transition-opacity">
            ErgoTask AI
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-foreground/5 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-3">
              <NavLinks mobile />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Navigation Links
function NavLinks({ mobile = false }) {
  // SSR-friendly cookie check via document is avoided. We use a simple heuristic:
  // if access_token cookie exists on client, show app links; otherwise show Login/Signup.
  const [authed, setAuthed] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const read = () => {
      try { setAuthed(document.cookie.includes('is_logged_in=1')); } catch {}
    };
    read();
    const onStorage = (e) => { if (e.key === 'auth:changed') read(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [pathname]);

  const baseLink = mobile ? 'block py-2 text-foreground/80 hover:text-foreground transition-colors' : 'text-sm text-foreground/80 hover:text-foreground transition-colors';
  const secondaryLink = mobile ? 'block py-2 text-foreground/70 hover:text-foreground transition-colors' : 'text-foreground/70 hover:text-foreground transition-colors';
  const onLoginPage = pathname === '/login';
  const onSignupPage = pathname === '/signup';

  if (!authed) {
    return (
      <>
        <Link href="/" className={baseLink}>Home</Link>
        <Link href="/login" className={mobile ? 'block py-2' : ''}>
          <span className={mobile
            ? 'inline-block w-full text-left px-4 py-2 rounded-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300'
            : 'px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300'}>
            Login
          </span>
        </Link>
        <Link href="/signup" className={mobile ? 'block py-2' : ''}>
          <span className={(mobile
            ? 'inline-block w-full text-left px-4 py-2 rounded-md bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 text-green-700 dark:text-green-300'
            : 'px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 text-green-700 dark:text-green-300') + (onLoginPage ? ' hidden' : '')}>
            Sign up
          </span>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/" className={baseLink}>Dashboard</Link>
      <Link href="/tasks" className={secondaryLink}>Tasks</Link>
      <Link href="/contexts" className={secondaryLink}>Contexts</Link>
      <button
        onClick={async () => {
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } catch {}
          try { localStorage.setItem('auth:changed', String(Date.now())); } catch {}
          window.location.href = '/';
        }}
        className={mobile ? 'block w-full text-left py-2 text-red-600' : 'px-4 py-2 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-700 dark:text-red-300 hover:from-red-500/30 hover:to-orange-500/30 transition-all duration-300 backdrop-blur-sm font-medium'}
      >
        Logout
      </button>
    </>
  );
}

// Minimal skeletons
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-foreground/10 ${className}`} />;
}

