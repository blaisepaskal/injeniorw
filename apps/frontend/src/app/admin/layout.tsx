'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, HardHat, Briefcase,
  DollarSign, Zap, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Overview',  href: '/admin',           icon: LayoutDashboard },
  { label: 'Users',     href: '/admin/users',     icon: Users },
  { label: 'Engineers', href: '/admin/engineers', icon: HardHat },
  { label: 'Jobs',      href: '/admin/jobs',      icon: Briefcase },
  { label: 'Payments',  href: '/admin/payments',  icon: DollarSign },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    if (user.role !== 'ADMIN') router.push('/')
  }, [user])

  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-surface flex">
      <div className="w-60 shrink-0 bg-surface-card border-r border-surface-border flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-surface-border">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="font-display text-lg">
            <span className="text-white">Injenio</span><span className="text-brand-400">Rw</span>
          </span>
          <span className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded bg-earth-500/20 text-earth-300 border border-earth-500/30">
            Admin
          </span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive ? 'bg-brand-500 text-white' : 'text-[var(--color-text-secondary)] hover:bg-surface-hover hover:text-white'
                )}>
                <Icon size={16} />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-surface-border">
          <div className="px-3 py-2 rounded-xl bg-surface-hover">
            <p className="text-xs font-medium text-white">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Platform Administrator</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
