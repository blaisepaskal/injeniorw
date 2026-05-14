'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, Zap, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuthStore, useUser } from '@/store/auth.store'
import toast from 'react-hot-toast'

const navLinks = [
  {
    label: 'Find Talent',
    href: '/engineers',
    submenu: [
      { label: 'Browse Engineers', href: '/engineers', desc: 'Explore all disciplines' },
      { label: 'Civil Engineers', href: '/engineers?discipline=civil', desc: 'Infrastructure & construction' },
      { label: 'Mechanical Engineers', href: '/engineers?discipline=mechanical', desc: 'Machines & systems' },
      { label: 'Electrical Engineers', href: '/engineers?discipline=electrical', desc: 'Power & electronics' },
      { label: 'Structural Engineers', href: '/engineers?discipline=structural', desc: 'Buildings & bridges' },
    ],
  },
  {
    label: 'Find Work',
    href: '/jobs',
    submenu: [
      { label: 'Browse Projects', href: '/jobs', desc: 'Active engineering jobs' },
      { label: 'Post a Project', href: '/projects/new', desc: 'Hire an engineer' },
    ],
  },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Enterprise', href: '/enterprise' },
]

export function Navbar() {
  const router = useRouter()
  const user = useUser()
  const { logout } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    router.push('/')
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/90 backdrop-blur-xl border-b border-surface-border shadow-card'
          : 'bg-transparent'
      }`}
    >
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
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-body font-medium text-[var(--color-text-secondary)] hover:text-white hover:bg-surface-hover transition-all duration-150"
                >
                  {link.label}
                  {link.submenu && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${activeDropdown === link.label ? 'rotate-180' : ''}`}
                    />
                  )}
                </Link>

                {/* Dropdown */}
                {link.submenu && activeDropdown === link.label && (
                  <div className="absolute top-full left-0 mt-2 w-64 card-dark shadow-card-hover p-2 animate-fade-in">
                    {link.submenu.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href as any}
                        className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors group"
                      >
                        <span className="text-sm font-medium text-white group-hover:text-brand-400 transition-colors">
                          {item.label}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-white hover:bg-surface-hover transition-colors">
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border">
                  <div className="w-6 h-6 rounded-full bg-brand-500/30 flex items-center justify-center">
                    <span className="text-brand-400 text-xs font-semibold">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <span className="text-sm text-white">{user.firstName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost py-2 text-sm flex items-center gap-1.5"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost py-2 text-sm">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary py-2 text-sm">
                  Join InjenioRw
                </Link>
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
        <div className="md:hidden bg-surface border-t border-surface-border px-4 py-4 space-y-2 animate-fade-in">
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
          <div className="pt-3 flex flex-col gap-2 border-t border-surface-border">
            {user ? (
              <>
                <Link href="/dashboard" className="btn-ghost py-2.5 text-sm w-full justify-center" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-ghost py-2.5 text-sm w-full justify-center">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost py-2.5 text-sm w-full justify-center">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary py-2.5 text-sm w-full justify-center">
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
