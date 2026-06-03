'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, Zap, LayoutDashboard, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

const navLinks = [
  {
    label: 'Find Talent',
    href: '/engineers',
    submenu: [
      { label: 'Browse Engineers',      href: '/engineers',                       desc: 'All disciplines' },
      { label: 'Civil Engineers',       href: '/engineers?discipline=CIVIL',      desc: 'Infrastructure & roads' },
      { label: 'Structural Engineers',  href: '/engineers?discipline=STRUCTURAL', desc: 'Buildings & bridges' },
      { label: 'Mechanical Engineers',  href: '/engineers?discipline=MECHANICAL', desc: 'Machines & systems' },
      { label: 'Electrical Engineers',  href: '/engineers?discipline=ELECTRICAL', desc: 'Power & electronics' },
    ],
  },
  {
    label: 'Find Work',
    href: '/jobs',
    submenu: [
      { label: 'Browse Projects', href: '/jobs',      desc: 'Active engineering jobs' },
      { label: 'Post a Project',  href: '/jobs/post', desc: 'Hire an engineer' },
    ],
  },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Enterprise',   href: '/enterprise' },
]

export function Navbar() {
  const router = useRouter()
  const { user, logout, initialize, isInitialized } = useAuthStore()
  const [scrolled, setScrolled]             = useState(false)
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen]     = useState(false)

  useEffect(() => {
    if (!isInitialized) initialize()
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const dashboardHref = user?.role === 'ENGINEER' ? '/dashboard/engineer' : '/dashboard/client'
  const userInitials  = user ? `${user.firstName[0]}${user.lastName[0]}` : ''

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-surface/90 backdrop-blur-xl border-b border-surface-border shadow-card'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center glow-brand group-hover:bg-brand-400 transition-colors">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <span className="font-display text-xl tracking-tight">
              <span className="text-white">Injenio</span>
              <span className="text-brand-400">Rw</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.submenu && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-white hover:bg-surface-hover transition-all duration-150"
                >
                  {link.label}
                  {link.submenu && (
                    <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                  )}
                </Link>
                {link.submenu && activeDropdown === link.label && (
                  <div className="absolute top-full left-0 mt-2 w-64 card-dark shadow-card-hover p-2 animate-fade-in">
                    {link.submenu.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors group"
                      >
                        <span className="text-sm font-medium text-white group-hover:text-brand-400 transition-colors">{item.label}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auth section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-hover transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-300 font-display">
                    {userInitials}
                  </div>
                  <span className="text-sm font-medium text-white">{user.firstName}</span>
                  <ChevronDown size={14} className={cn('text-[var(--color-text-muted)] transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 card-dark shadow-card-hover p-2 animate-fade-in">
                    <div className="px-3 py-2 mb-1 border-b border-surface-border">
                      <p className="text-xs font-medium text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
                    </div>
                    <Link href={dashboardHref} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors group">
                      <LayoutDashboard size={14} className="text-brand-400" />
                      <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-white">Dashboard</span>
                    </Link>
                    {user.role === 'ENGINEER' && (
                      <Link href="/engineers/me/edit" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors group">
                        <User size={14} className="text-brand-400" />
                        <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-white">Edit Profile</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors group w-full mt-1 border-t border-surface-border pt-2"
                    >
                      <LogOut size={14} className="text-red-400" />
                      <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-red-400 transition-colors">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost py-2 text-sm">Sign In</Link>
                <Link href="/auth/register" className="btn-primary py-2 text-sm">Join InjenioRw</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-surface-border px-4 py-4 space-y-1 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-white hover:bg-surface-hover transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-surface-border space-y-2">
            {user ? (
              <>
                <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 rounded-lg text-sm font-medium text-white hover:bg-surface-hover">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="w-full text-left py-2.5 px-3 rounded-lg text-sm text-red-400 hover:bg-surface-hover">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost py-2.5 text-sm w-full justify-center" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary py-2.5 text-sm w-full justify-center" onClick={() => setMobileOpen(false)}>
                  Join InjenioRw
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
