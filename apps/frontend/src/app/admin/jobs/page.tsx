'use client'

import { useState, useEffect } from 'react'
import { Search, Eye, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { DISCIPLINE_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import toast from 'react-hot-toast'

const STATUS_STYLES: Record<string, string> = {
  OPEN:        'bg-brand-500/15 text-brand-300 border-brand-500/30',
  DRAFT:       'bg-surface-hover text-[var(--color-text-muted)] border-surface-border',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  COMPLETED:   'bg-green-500/15 text-green-300 border-green-500/30',
  CANCELLED:   'bg-red-500/15 text-red-300 border-red-500/30',
  PAUSED:      'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
}

export default function AdminJobsPage() {
  const [jobs, setJobs]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('ALL')
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)
  const LIMIT = 20

  useEffect(() => { fetchJobs() }, [search, status, page])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const res: any = await api.get('/admin/jobs', {
        params: { search: search || undefined, status: status !== 'ALL' ? status : undefined, page, limit: LIMIT },
      })
      setJobs(res.data?.jobs ?? [])
      setTotal(res.data?.pagination?.total ?? 0)
    } catch { setJobs([]) }
    finally { setLoading(false) }
  }

  const cancelJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to cancel this job?')) return
    try {
      await api.patch(`/admin/jobs/${jobId}`, { status: 'CANCELLED' })
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'CANCELLED' } : j))
      toast.success('Job cancelled')
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-white mb-1">Jobs</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">{total} total job postings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search jobs…" className="input-dark pl-10 text-sm" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input-dark text-sm min-w-[140px]">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DRAFT'].map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</option>
          ))}
        </select>
      </div>

      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                {['Title', 'Client', 'Discipline', 'Proposals', 'Budget', 'Status', 'Posted', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-mono font-medium text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4,5,6,7,8].map(j => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-hover rounded animate-pulse" /></td>)}</tr>
                ))
              ) : jobs.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[var(--color-text-muted)]">No jobs found</td></tr>
              ) : (
                jobs.map(job => (
                  <tr key={job.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 max-w-[200px]"><p className="text-sm font-medium text-white truncate">{job.title}</p></td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                      {job.clientProfile?.companyName || `${job.clientProfile?.user?.firstName} ${job.clientProfile?.user?.lastName}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                      {DISCIPLINE_LABELS[job.discipline as keyof typeof DISCIPLINE_LABELS] ?? job.discipline}
                    </td>
                    <td className="px-4 py-3 text-xs text-white text-center">{job._count?.proposals ?? job.proposalCount ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-white whitespace-nowrap">
                      {job.budgetMin ? `$${Number(job.budgetMin).toLocaleString()}` : job.hourlyRateMin ? `$${job.hourlyRateMin}/hr` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', STATUS_STYLES[job.status] ?? '')}>{job.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/jobs/${job.id}`} target="_blank" className="p-1.5 rounded-lg hover:bg-surface-border text-[var(--color-text-muted)] hover:text-white transition-colors"><Eye size={13} /></Link>
                        {job.status === 'OPEN' && (
                          <button onClick={() => cancelJob(job.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"><XCircle size={13} /></button>
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
