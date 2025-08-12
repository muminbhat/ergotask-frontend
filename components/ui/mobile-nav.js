"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Layers } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

export function MobileNav() {
  const pathname = usePathname()
  const isActive = (href) => pathname === href

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/70 backdrop-blur md:hidden">
      <div className="mx-auto max-w-7xl flex items-center justify-around h-14 px-4">
        <Link href="/" className={`flex flex-col items-center text-xs ${isActive('/') ? 'text-white' : 'text-neutral-400'}`}>
          <Home className="w-5 h-5" />
          Home
        </Link>
        <Link href="/tasks" className={`flex flex-col items-center text-xs ${isActive('/tasks') ? 'text-white' : 'text-neutral-400'}`}>
          <LayoutGrid className="w-5 h-5" />
          Tasks
        </Link>
        <Link href="/contexts" className={`flex flex-col items-center text-xs ${isActive('/contexts') ? 'text-white' : 'text-neutral-400'}`}>
          <Layers className="w-5 h-5" />
          Contexts
        </Link>
        <ThemeToggle />
      </div>
    </div>
  )
}
