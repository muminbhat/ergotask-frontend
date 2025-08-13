"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, LayoutGrid, Layers } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

export function MobileNav() {
  const pathname = usePathname()
  const isActive = (href) => pathname === href
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    try { setAuthed(document.cookie.includes('access_token=')) } catch {}
  }, [])

  return (
    <div>
    {/* <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/70 backdrop-blur md:hidden">
      <div className="mx-auto max-w-7xl flex items-center justify-around h-14 px-4">
        <Link href="/" className={`flex flex-col items-center text-xs ${isActive('/') ? 'text-white' : 'text-neutral-300'}`}>
          <Home className="w-5 h-5" />
          Home
        </Link>
        {authed ? (
          <>
            <Link href="/tasks" className={`flex flex-col items-center text-xs ${isActive('/tasks') ? 'text-white' : 'text-neutral-300'}`}>
              <LayoutGrid className="w-5 h-5" />
              Tasks
            </Link>
            <Link href="/contexts" className={`flex flex-col items-center text-xs ${isActive('/contexts') ? 'text-white' : 'text-neutral-300'}`}>
              <Layers className="w-5 h-5" />
              Contexts
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className={`flex flex-col items-center text-xs ${isActive('/login') ? 'text-white' : 'text-neutral-300'}`}>
              <LayoutGrid className="w-5 h-5" />
              Login
            </Link>
            <Link href="/signup" className={`flex flex-col items-center text-xs ${isActive('/signup') ? 'text-white' : 'text-neutral-300'}`}>
              <Layers className="w-5 h-5" />
              Sign up
            </Link>
          </>
        )}
        <ThemeToggle />
      </div>
    </div> */}
    </div>
  )
}
