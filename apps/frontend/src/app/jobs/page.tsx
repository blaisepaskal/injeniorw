'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search, SlidersHorizontal, MapPin, Clock,
  DollarSign, Users, X, ChevronRight, Briefcase,
} from 'lucide-react'
import { useJobs } from '@/hooks'
import { DISCIPLINE_LABELS, EXPERIENCE_LABELS } from '@/types'
import type { Discipline, ExperienceLevel, JobType } from '@/types'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { useDebounce } from '@/hooks/useDebounce'

const JOB_TYPE_LABELS: Record<JobType, string> = {
  HOURLY:    'Hourly',
  FIXED:     'Fixed Price',
  MILESTONE: 'Milestone',
}

const JOB_TYPE_COLORS: Record<JobType, string> = {
  HOURLY:    'bg-brand-500/15 text-brand-300 border-brand-500/30',
  FIXED:     'bg-earth-500/15 text-earth-300 border-earth-500/30',
  MILESTONE: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
}

export default function JobsPage() {
  const [search, setSearch]         = useState('')
  const [discipline, setDiscipline] = useState<Discipline | ''>('')
  const [jobType, setJobType]       = useState<JobType | ''>('')
  const [experience, setExperience] = useState<ExperienceLevel | ''>('')
  const [isRemote, setIsRemote]     = useState<boolean | undefined>()
  const [budgetMin, setBudgetMin]   = useState('')
  const [budgetMax, setBudgetMax]   = useState('')
  const [sortBy, setSortBy]         = useState('newest')
  const [page, setPage]             = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const [debouncedSearch] = useDebounce(search, 400)

  const filters = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(discipline  && { discipline }),
    ...(jobType     && { jobType }),
    ...(experience  && { experienceLevel: experience }),
    ...(isRemote !== undefined && { isRemote }),
    ...(budgetMin   && { budgetMin }),
    ...(budgetMax   && { budgetMax }),
    sortBy,
    page,
    limit: 15,
  }

  const { data, isLoading } = useJobs(filters)
  const jobs       = (data as any)?.data?.jobs ?? []
  const pagination = (data as any)?.data?.pagination

  const activeFilterCount = [discipline, jobType, experience, budgetMin, budgetMax, isRemote !== undefined ? '1' : ''].filter(Boolean).length

  const clearFilters = () => {
    setDiscipline(''); setJobType(''); setExperience('')
    setIsRemote(undefined); setBudgetMin(''); setBudgetMax(''); setPage(1)
  }

  const formatBudget = (job: any) => {
    if (job.jobType === 'HOURLY' && job.hourlyRateMin) {
      return job.hourlyRateMax ? `$${job.hourlyRateMin}–$${job.hourlyRateMax}/hr` : `From $${job.hourlyRateMin}/hr`
    }
    if (job.budgetMin) {
      return job.budgetMax ? `$${job.budgetMin.toLocaleString()}–$${job.budgetMax.toLocaleString()}` : `From $${job.budgetMin.toLocaleString()}`
    }
    return 'Budget TBD'
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="section-label">Engineering Projects</p>
            <h1 className="font-display text-4xl text-white">
              Find Your Next <span className="text-gradient-brand">Project</span>
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              {pagination?.total ?? '...'} open projects waiting for skilled engineers.
            </p>
          </div>
          <Link href="/jobs/post" className="btn-primary shrink-0">+ Post a Project</Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search projects by title, skill, or description…" className="input-dark pl-10" />
          </div>
          <div className="flex gap-2">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-dark min-w-[150px]">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="budget_high">Budget: High</option>
              <option value="budget_low">Budget: Low</option>
            </select>
            <button onClick={() => setShowFilters(!showFilters)} className={cn('btn-ghost gap-2 relative', showFilters && 'border-brand-500/50 text-white')}>
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-mono">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="card-dark p-5 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">Discipline</label>
              <select value={discipline} onChange={e => { setDiscipline(e.target.value as any); setPage(1) }} className="input-dark text-sm">
                <option value="">All disciplines</option>
                {Object.entries(DISCIPLINE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">Contract Type</label>
              <select value={jobType} onChange={e => { setJobType(e.target.value as any); setPage(1) }} className="input-dark text-sm">
                <option value="">All types</option>
                {Object.entries(JOB_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">Experience Level</label>
              <select value={experience} onChange={e => { setExperience(e.target.value as any); setPage(1) }} className="input-dark text-sm">
                <option value="">Any level</option>
                {Object.entries(EXPERIENCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">Budget Min ($)</label>
              <input type="number" value={budgetMin} onChange={e => { setBudgetMin(e.target.value); setPage(1) }} placeholder="e.g. 500" className="input-dark text-sm" />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">Budget Max ($)</label>
              <input type="number" value={budgetMax} onChange={e => { setBudgetMax(e.target.value); setPage(1) }} placeholder="e.g. 5000" className="input-dark text-sm" />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">Location</label>
              <div className="flex gap-2">
                {[{ label: 'Any', value: undefined }, { label: 'Remote only', value: true }, { label: 'On-site', value: false }].map(opt => (
                  <button key={String(opt.value)} onClick={() => { setIsRemote(opt.value); setPage(1) }}
                    className={cn('flex-1 py-2.5 rounded-xl text-xs border transition-all',
                      isRemote === opt.value ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-surface-border text-[var(--color-text-muted)] hover:border-brand-500/40'
                    )}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-end col-span-full">
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-white">
                  <X size={14} /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} className="card-dark p-6 animate-pulse">
                <div className="h-5 bg-surface-hover rounded w-2/3 mb-3" />
                <div className="h-3 bg-surface-hover rounded w-full mb-2" />
                <div className="h-3 bg-surface-hover rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase size={48} className="text-surface-border mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)] text-lg mb-2">No projects found</p>
            <p className="text-[var(--color-text-muted)] text-sm mb-6">Try adjusting your filters or be the first to post one.</p>
            <Link href="/jobs/post" className="btn-primary">Post a Project</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job: any) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="group block card-dark p-6 transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={cn('text-xs px-2.5 py-0.5 rounded-full border font-mono', JOB_TYPE_COLORS[job.jobType as JobType])}>
                        {JOB_TYPE_LABELS[job.jobType as JobType]}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-hover border border-surface-border text-[var(--color-text-muted)]">
                        {DISCIPLINE_LABELS[job.discipline as Discipline]}
                      </span>
                      {job.isRemote && <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-hover border border-surface-border text-[var(--color-text-muted)]">Remote</span>}
                    </div>
                    <h3 className="font-semibold text-white text-base group-hover:text-brand-400 transition-colors mb-2 line-clamp-1">{job.title}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills?.slice(0, 5).map((skill: string) => (
                        <span key={skill} className="text-xs px-2 py-0.5 rounded-lg bg-surface-hover border border-surface-border text-[var(--color-text-muted)]">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="sm:text-right shrink-0 space-y-2">
                    <p className="text-lg font-display font-bold text-white">{formatBudget(job)}</p>
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 text-xs text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1"><Users size={11} /> {job._count?.proposals ?? job.proposalCount} proposals</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                      {job.clientProfile && (
                        <span className="flex items-center gap-1">
                          <Briefcase size={11} />
                          {job.clientProfile.companyName || `${job.clientProfile.user?.firstName} ${job.clientProfile.user?.lastName}`}
                          {job.clientProfile.isVerified && ' ✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {EXPERIENCE_LABELS[job.experienceLevel as ExperienceLevel]}
                    {job.duration && ` · ${job.duration}`}
                    {job.location && ` · ${job.location}`}
                  </span>
                  <span className="text-xs text-brand-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View & Apply <ChevronRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrev} className="btn-ghost py-2 px-4 text-sm disabled:opacity-40">Previous</button>
            <span className="text-sm text-[var(--color-text-secondary)]">Page {page} of {pagination.totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext} className="btn-ghost py-2 px-4 text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
