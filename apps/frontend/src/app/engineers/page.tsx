'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, Star, MapPin, Briefcase, X, ChevronRight } from 'lucide-react'
import { useEngineers } from '@/hooks'
import { DISCIPLINE_LABELS, EXPERIENCE_LABELS, RWANDA_PROVINCES } from '@/types'
import type { Discipline, ExperienceLevel, AvailabilityStatus } from '@/types'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

const SORT_OPTIONS = [
  { value: 'rating',    label: 'Top Rated' },
  { value: 'projects',  label: 'Most Projects' },
  { value: 'rate_low',  label: 'Rate: Low to High' },
  { value: 'rate_high', label: 'Rate: High to Low' },
  { value: 'newest',    label: 'Newest' },
]

export default function EngineersPage() {
  const [search, setSearch]       = useState('')
  const [discipline, setDiscipline] = useState<Discipline | ''>('')
  const [experience, setExperience] = useState<ExperienceLevel | ''>('')
  const [availability, setAvailability] = useState<AvailabilityStatus | ''>('')
  const [province, setProvince]   = useState('')
  const [rateMax, setRateMax]     = useState('')
  const [sortBy, setSortBy]       = useState('rating')
  const [page, setPage]           = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const [debouncedSearch] = useDebounce(search, 400)

  const filters = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(discipline    && { discipline }),
    ...(experience    && { experienceLevel: experience }),
    ...(availability  && { availability }),
    ...(province      && { province }),
    ...(rateMax       && { hourlyRateMax: rateMax }),
    sortBy,
    page,
    limit: 12,
  }

  const { data, isLoading } = useEngineers(filters)
  const engineers   = (data as any)?.data?.engineers ?? []
  const pagination  = (data as any)?.data?.pagination

  const activeFilterCount = [discipline, experience, availability, province, rateMax].filter(Boolean).length

  const clearFilters = () => {
    setDiscipline(''); setExperience(''); setAvailability('')
    setProvince(''); setRateMax(''); setPage(1)
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        {/* Page header */}
        <div className="mb-8">
          <p className="section-label">Engineering Talent</p>
          <h1 className="font-display text-4xl text-white mb-2">
            Find Rwanda's Best <span className="text-gradient-brand">Engineers</span>
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            {pagination?.total ?? '...'} verified engineers ready to deliver.
          </p>
        </div>

        {/* Search + controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, skill, or discipline…"
              className="input-dark pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-dark min-w-[160px] cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn('btn-ghost gap-2 relative', showFilters && 'border-brand-500/50 text-white')}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-mono">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="card-dark p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">Discipline</label>
              <select value={discipline} onChange={e => { setDiscipline(e.target.value as any); setPage(1) }} className="input-dark text-sm">
                <option value="">All disciplines</option>
                {Object.entries(DISCIPLINE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">Experience</label>
              <select value={experience} onChange={e => { setExperience(e.target.value as any); setPage(1) }} className="input-dark text-sm">
                <option value="">All levels</option>
                {Object.entries(EXPERIENCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">Availability</label>
              <select value={availability} onChange={e => { setAvailability(e.target.value as any); setPage(1) }} className="input-dark text-sm">
                <option value="">Any availability</option>
                <option value="AVAILABLE">Available now</option>
                <option value="BUSY">Busy</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">Province</label>
              <select value={province} onChange={e => { setProvince(e.target.value); setPage(1) }} className="input-dark text-sm">
                <option value="">All provinces</option>
                {RWANDA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">Max Rate ($/hr)</label>
              <input
                type="number"
                value={rateMax}
                onChange={e => { setRateMax(e.target.value); setPage(1) }}
                placeholder="e.g. 80"
                className="input-dark text-sm"
              />
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-end">
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
                  <X size={14} /> Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Engineer grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} className="card-dark p-6 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-surface-hover mb-4" />
                <div className="h-4 bg-surface-hover rounded w-3/4 mb-2" />
                <div className="h-3 bg-surface-hover rounded w-1/2 mb-4" />
                <div className="h-8 bg-surface-hover rounded" />
              </div>
            ))}
          </div>
        ) : engineers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-text-muted)] text-lg mb-4">No engineers found</p>
            <button onClick={clearFilters} className="btn-ghost">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {engineers.map((engineer: any) => {
              const user = engineer.user
              const initials = `${user.firstName[0]}${user.lastName[0]}`
              return (
                <Link
                  key={engineer.id}
                  href={`/engineers/${engineer.id}`}
                  className="group block card-dark p-5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center font-display text-brand-300 font-bold">
                      {initials}
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      engineer.availability === 'AVAILABLE' ? 'badge-available' : 'badge-busy'
                    )}>
                      {engineer.availability === 'AVAILABLE' ? '● Available' : '● Busy'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-sm group-hover:text-brand-400 transition-colors mb-0.5">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-3 line-clamp-1">
                    {engineer.headline || DISCIPLINE_LABELS[engineer.discipline]}
                  </p>

                  <div className="flex items-center gap-3 mb-3 text-xs text-[var(--color-text-muted)]">
                    {(engineer.district || user.city) && (
                      <span className="flex items-center gap-1">
                        <MapPin size={10} className="text-brand-500" />
                        {engineer.district || user.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Briefcase size={10} className="text-brand-500" />
                      {engineer.completedProjects} jobs
                    </span>
                  </div>

                  {engineer.avgRating > 0 && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold text-white">{engineer.avgRating.toFixed(1)}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">({engineer.totalReviews})</span>
                    </div>
                  )}

                  {engineer.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {engineer.skills.slice(0, 3).map((s: any) => (
                        <span key={s.id} className="text-xs px-2 py-0.5 rounded-lg bg-surface-hover border border-surface-border text-[var(--color-text-muted)]">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-surface-border">
                    {engineer.hourlyRate ? (
                      <span className="text-sm font-display font-bold text-white">
                        ${engineer.hourlyRate}<span className="text-xs text-[var(--color-text-muted)] font-body">/hr</span>
                      </span>
                    ) : <span />}
                    <span className="text-xs text-brand-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      View profile <ChevronRight size={12} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
              className="btn-ghost py-2 px-4 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                      page === p
                        ? 'bg-brand-500 text-white'
                        : 'text-[var(--color-text-secondary)] hover:bg-surface-hover hover:text-white'
                    )}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!pagination.hasNext}
              className="btn-ghost py-2 px-4 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
