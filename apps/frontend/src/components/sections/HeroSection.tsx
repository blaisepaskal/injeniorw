'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Star, TrendingUp, Users, Shield } from 'lucide-react'

const stats = [
  { value: '2,400+', label: 'Engineers', icon: Users },
  { value: '98%', label: 'Satisfaction', icon: Star },
  { value: '850+', label: 'Projects Done', icon: TrendingUp },
  { value: '100%', label: 'Verified', icon: Shield },
]

const disciplines = [
  'Civil Engineering',
  'Structural Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Environmental Engineering',
  'Geotechnical Engineering',
  'Transportation Engineering',
  'Water Resources',
]

export function HeroSection() {
  const tickerRef = useRef<HTMLDivElement>(null)

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-surface">
      {/* Layered background */}
      <div className="absolute inset-0 bg-grid opacity-100" />

      {/* Radial gradient blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-earth-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-brand-900/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Floating geometric accent */}
      <div className="absolute top-24 right-8 lg:right-16 w-[280px] h-[280px] opacity-10 animate-spin-slow pointer-events-none">
        <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="140,10 270,210 10,210" stroke="#1f9963" strokeWidth="1.5" fill="none" />
          <polygon points="140,40 245,200 35,200" stroke="#1f9963" strokeWidth="1" fill="none" />
          <polygon points="140,70 220,190 60,190" stroke="#1f9963" strokeWidth="0.5" fill="none" />
          <circle cx="140" cy="140" r="100" stroke="#1f9963" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />
          <circle cx="140" cy="140" r="60" stroke="#d97f27" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-4xl">
          {/* Tag line */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-xs font-mono font-medium tracking-widest text-brand-300 uppercase">
              Rwanda's Premier Engineering Platform
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-display mb-6 animate-fade-up" style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}>
            <span className="text-white block">Engineering Talent</span>
            <span className="text-white block">Born in Rwanda,</span>
            <span className="text-gradient-brand block">Built for the World.</span>
          </h1>

          <p
            className="text-[var(--color-text-secondary)] text-lg md:text-xl max-w-2xl leading-relaxed mb-10 animate-fade-up delay-200"
            style={{ animationFillMode: 'both' }}
          >
            Connect with Rwanda's finest civil, mechanical, structural and electrical engineers.
            Verified talent. Transparent contracts. Milestone-based payments with MTN Mobile Money.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-up delay-300" style={{ animationFillMode: 'both' }}>
            <Link href="/engineers" className="btn-primary text-base px-8 py-4 rounded-2xl">
              Find an Engineer
              <ArrowRight size={18} />
            </Link>
            <Link href="/auth/register?role=engineer" className="btn-ghost text-base px-8 py-4 rounded-2xl">
              Join as an Engineer
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up delay-500"
            style={{ animationFillMode: 'both' }}
          >
            {stats.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col gap-1 p-4 rounded-2xl bg-surface-card border border-surface-border hover:border-brand-500/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className="text-brand-400" />
                  <span className="text-xs text-[var(--color-text-muted)] font-mono uppercase tracking-wider">
                    {label}
                  </span>
                </div>
                <span className="font-display text-2xl text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Discipline ticker */}
      <div className="relative z-10 border-t border-surface-border py-5 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />
        <div className="flex gap-8 animate-[ticker_30s_linear_infinite]" ref={tickerRef}>
          {[...disciplines, ...disciplines, ...disciplines].map((d, i) => (
            <div key={i} className="flex items-center gap-3 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
              <span className="text-sm font-body text-[var(--color-text-muted)] font-medium">{d}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.33%); }
        }
      `}</style>
    </section>
  )
}
