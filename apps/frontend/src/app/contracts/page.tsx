'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, ChevronRight, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useMyContracts } from '@/hooks'
import { useAuthStore } from '@/store/auth.store'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { ContractStatus } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:    'bg-brand-500/15 text-brand-300 border-brand-500/30',
  PAUSED:    'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  COMPLETED: 'bg-green-500/15 text-green-300 border-green-500/30',
  DISPUTED:  'bg-red-500/15 text-red-300 border-red-500/30',
  CANCELLED: 'bg-surface-hover text-[var(--color-text-muted)] border-surface-border',
}

type FilterTab = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'OTHER'

export default function MyContractsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [filter, setFilter] = useState<FilterTab>('ALL')

  const { data, isLoading } = useMyContracts()

  useEffect(() => {
    if (!user) router.push('/auth/login')
  }, [user])

  const contracts = (data as any)?.data ?? []

  const filtered = contracts.filter((c: any) => {
    if (filter === 'ALL')       return true
    if (filter === 'ACTIVE')    return c.status === 'ACTIVE'
    if (filter === 'COMPLETED') return c.status === 'COMPLETED'
    return ['PAUSED', 'DISPUTED', 'CANCELLED'].includes(c.status)
  })

  const counts = {
    ALL:       contracts.length,
    ACTIVE:    contracts.filter((c: any) => c.status === 'ACTIVE').length,
    COMPLETED: contracts.filter((c: any) => c.status === 'COMPLETED').length,
    OTHER:     contracts.filter((c: any) => ['PAUSED', 'DISPUTED', 'CANCELLED'].includes(c.status)).length,
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        <div className="mb-8">
          <p className="section-label">Contracts</p>
          <h1 className="font-display text-3xl text-white">My Contracts</h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">Track milestones, deliverables and payments.</p>
        </div>

        <div className="flex gap-1 mb-6 bg-surface-card p-1 rounded-2xl border border-surface-border w-fit">
          {(['ALL', 'ACTIVE', 'COMPLETED', 'OTHER'] as FilterTab[]).map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                filter === tab ? 'bg-brand-500 text-white' : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-surface-hover'
              )}>
              {tab}
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-mono',
                filter === tab ? 'bg-white/20 text-white' : 'bg-surface-hover text-[var(--color-text-muted)]'
              )}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="card-dark p-6 animate-pulse">
                <div className="h-5 bg-surface-hover rounded w-1/2 mb-3" />
                <div className="h-3 bg-surface-hover rounded w-full mb-2" />
                <div className="h-1.5 bg-surface-hover rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-dark p-12 text-center">
            <FileText size={40} className="text-surface-border mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)] mb-2">No contracts here yet.</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              {user?.role === 'ENGINEER'
                ? 'Submit proposals to open projects to get your first contract.'
                : 'Post a project and hire an engineer to create your first contract.'}
            </p>
            <Link href={user?.role === 'ENGINEER' ? '/jobs' : '/jobs/post'} className="btn-primary">
              {user?.role === 'ENGINEER' ? 'Browse Projects' : 'Post a Project'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((contract: any) => {
              const milestones    = contract.milestones ?? []
              const paidCount     = milestones.filter((m: any) => m.status === 'PAID').length
              const totalCount    = milestones.length
              const progressPct   = totalCount > 0 ? (paidCount / totalCount) * 100 : 0
              const pendingReview = milestones.filter((m: any) => m.status === 'SUBMITTED').length

              const counterpart = user?.role === 'ENGINEER' ? contract.clientProfile : contract.engineerProfile
              const counterpartName = user?.role === 'ENGINEER'
                ? (counterpart?.companyName || `${counterpart?.user?.firstName} ${counterpart?.user?.lastName}`)
                : `${counterpart?.user?.firstName} ${counterpart?.user?.lastName}`

              return (
                <Link key={contract.id} href={`/contracts/${contract.id}`} className="group block card-dark p-6 hover:-translate-y-0.5 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium text-white group-hover:text-brand-400 transition-colors line-clamp-1">{contract.title}</h3>
                        {pendingReview > 0 && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 shrink-0">
                            <AlertCircle size={10} /> {pendingReview} to review
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        with {counterpartName} · {formatDistanceToNow(new Date(contract.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('text-xs px-2.5 py-0.5 rounded-full border', STATUS_STYLES[contract.status])}>{contract.status}</span>
                      <ChevronRight size={16} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  {totalCount > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--color-text-muted)]">Milestones</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{paidCount}/{totalCount} paid</span>
                      </div>
                      <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1"><DollarSign size={11} className="text-brand-400" />${Number(contract.paidAmount).toLocaleString()} / ${Number(contract.totalAmount).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{contract.job?.discipline}</span>
                    {contract.status === 'COMPLETED' && <span className="flex items-center gap-1 text-green-400"><CheckCircle size={11} /> Completed</span>}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
