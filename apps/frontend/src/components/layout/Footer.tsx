import Link from 'next/link'
import { Zap, Twitter, Linkedin, Github, Mail } from 'lucide-react'

const links = {
  Platform: [
    { label: 'Find Engineers', href: '/engineers' },
    { label: 'Browse Projects', href: '/jobs' },
    { label: 'Post a Project', href: '/projects/new' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Enterprise', href: '/enterprise' },
  ],
  Disciplines: [
    { label: 'Civil Engineering', href: '/engineers?discipline=civil' },
    { label: 'Structural Engineering', href: '/engineers?discipline=structural' },
    { label: 'Mechanical Engineering', href: '/engineers?discipline=mechanical' },
    { label: 'Electrical Engineering', href: '/engineers?discipline=electrical' },
    { label: 'Environmental Engineering', href: '/engineers?discipline=environmental' },
  ],
  Company: [
    { label: 'About InjenioRw', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
    { label: 'Press', href: '/press' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Trust & Safety', href: '/trust' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-surface-card border-t border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Zap size={16} className="text-white fill-white" />
              </div>
              <span className="font-display text-xl">
                <span className="text-white">Injenio</span>
                <span className="text-brand-400">Rw</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6">
              Rwanda's premier engineering talent marketplace. Connecting Africa's brightest minds with the world's most ambitious projects.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg border border-surface-border flex items-center justify-center text-[var(--color-text-muted)] hover:text-brand-400 hover:border-brand-500/40 transition-all"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-mono font-semibold tracking-widest uppercase text-[var(--color-text-muted)] mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-surface-border">
          <p className="text-sm text-[var(--color-text-muted)]">
            © 2025 InjenioRw. Made with pride in 🇷🇼 Kigali, Rwanda.
          </p>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
