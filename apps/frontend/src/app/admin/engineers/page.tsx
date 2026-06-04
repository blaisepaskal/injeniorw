'use client'

import { useState, useEffect } from 'react'
import { Search, Shield, CheckCircle, XCircle, Eye, Star } from 'lucide-react'
import { api } from '@/lib/api'
import { DISCIPLINE_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface EngineerRow {
  id: string
  verificationStatus: string
  discipline: string
  experienceLevel: string
  avgRating: number
  totalReviews: number
  completedProjects: number
  hourlyRate?: number
  createdAt: string
  user: { id: string; firstName: string; lastName: string; email: string; city?: string }
}

const VERIFICATION_STYLES: Record<string, string> = {
  UNVERIFIED: 'bg-surface-hover text-[var(--color-text-muted)] border-surface-border',
  PENDING:    'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  VERIFIED:   'bg-brand-500/15 text-brand-300 border-brand-500/30',
  REJECTED:   'bg-red-500/15 text-red-300 border-red-500/30',
}

export default function AdminEngineersPage() {
  const [engineers, setEngineers] = useState<EngineerRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('ALL')
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const LIMIT = 20

  useEffect(() => { fetchEngineers() }, [search, filter, page])

  const fetchEngineers = async () => {
    try {
      setLoading(true)
      const res: any = await api.get('/admin/engineers', {
        params: { search: search || undefined, verificationStatus: filter !== 'ALL' ? filter : undefined, page, limit: LIMIT },
      })
      setEngineers(res.data?.engineers ?? [])
      setTotal(res.data?.pagination?.total ?? 0)
    } catch { setEngineers([]) }
    finally { setLoading(false) }
  }

  const updateVerification = async (engineerProfileId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.patch(`/admin/engineers/${engineerProfileId}/verify`, { status })
      setEngineers(prev => prev.map(e => e.id === engineerProfileId ? { ...e, verificationStatus: status } : e))
      toast.success(`Engineer ${status === 'VERIFIED' ? 'verified' : 'rejected'} successfully`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update verification')
    }
  }

  const pendingCount = engineers.filter(e => e.verificationStatus === 'PENDING').length

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-white mb-1">Engineers</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{total} total engineers</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <Shield size={14} className="text-yellow-400" />
            <span className="text-sm text-yellow-300 font-medium">{pendingCount} awaiting verification</span>
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-5 bg-surface-card p-1 rounded-2xl border border-surface-border w-fit">
        {['ALL', 'PENDING', 'VERIFIED', 'UNVERIFIED', 'REJECTED'].map(tab => (
          <button key={tab} onClick={() => { setFilter(tab); setPage(1) }}
            className={cn('px-4 py-2 rounded-xl text-xs font-medium transition-all',
              filter === tab ? 'bg-brand-500 text-white' : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-surface-hover'
            )}>
            {tab}
          </button>
        ))}
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search engineers by name, email or discipline…" className="input-dark pl-10 text-sm" />
      </div>

      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                {['Engineer', 'Discipline', 'Rating', 'Rate', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-mono font-medium text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4,5,6,7].map(j => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-hover rounded animate-pulse" /></td>)}</tr>
                ))
              ) : engineers.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[var(--color-text-muted)]">No engineers found</td></tr>
              ) : (
                engineers.map(eng => (
                  <tr key={eng.id} className={cn('hover:bg-surface-hover transition-colors', eng.verificationStatus === 'PENDING' && 'bg-yellow-500/3')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-300 shrink-0">
                          {eng.user.firstName[0]}{eng.user.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white whitespace-nowrap">{eng.user.firstName} {eng.user.lastName}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{eng.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                      {DISCIPLINE_LABELS[eng.discipline as keyof typeof DISCIPLINE_LABELS] ?? eng.discipline}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-white">{eng.avgRating.toFixed(1)}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">({eng.totalReviews})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-white whitespace-nowrap">{eng.hourlyRate ? `$${eng.hourlyRate}/hr` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', VERIFICATION_STYLES[eng.verificationStatus])}>{eng.verificationStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">{format(new Date(eng.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/engineers/${eng.id}`} target="_blank" className="p-1.5 rounded-lg hover:bg-surface-border transition-colors text-[var(--color-text-muted)] hover:text-white" title="View profile">
                          <Eye size={13} />
                        </Link>
                        {eng.verificationStatus === 'PENDING' && (
                          <>
                            <button onClick={() => updateVerification(eng.id, 'VERIFIED')} className="p-1.5 rounded-lg hover:bg-brand-500/20 transition-colors text-brand-400 hover:text-brand-300" title="Approve verification">
                              <CheckCircle size={13} />
                            </button>
                            <button onClick={() => updateVerification(eng.id, 'REJECTED')} className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-[var(--color-text-muted)] hover:text-red-400" title="Reject verification">
                              <XCircle size={13} />
                            </button>
                          </>
                        )}
                        {eng.verificationStatus === 'UNVERIFIED' && (
                          <button onClick={() => updateVerification(eng.id, 'VERIFIED')} className="text-xs text-brand-400 hover:text-brand-300 px-2 py-1 rounded-lg hover:bg-brand-500/10 transition-colors">
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {total > LIMIT && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
            <p className="text-xs text-[var(--color-text-muted)]">Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost py-1.5 px-3 text-xs disabled:opacity-40">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * LIMIT >= total} className="btn-ghost py-1.5 px-3 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
