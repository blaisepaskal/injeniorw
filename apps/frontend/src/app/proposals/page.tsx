'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Send, ChevronRight, Clock, DollarSign, Briefcase } from 'lucide-react'
import { useMyProposals } from '@/hooks'
import { useAuthStore } from '@/store/auth.store'
import { DISCIPLINE_LABELS } from '@/types'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const STATUS_STYLES: Record<string, string> = {
  PENDING:     'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  SHORTLISTED: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  ACCEPTED:    'bg-brand-500/15 text-brand-300 border-brand-500/30',
  REJECTED:    'bg-red-500/15 text-red-300 border-red-500/30',
  WITHDRAWN:   'bg-surface-hover text-[var(--color-text-muted)] border-surface-border',
}

const STATUS_DESCRIPTIONS: Record<string, string> = {
  PENDING:     'Waiting for client review',
  SHORTLISTED: 'Client has shortlisted you',
  ACCEPTED:    'Accepted — create a contract to begin',
  REJECTED:    'Not selected for this project',
  WITHDRAWN:   'You withdrew this proposal',
}

export default function MyProposalsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { data, isLoading } = useMyProposals()

  useEffect(() => {
    if (!user) router.push('/auth/login')
    if (user && user.role !== 'ENGINEER') router.push('/dashboard/client')
  }, [user])

  const proposals = (data as any)?.data ?? []

  const grouped = {
    ACCEPTED:    proposals.filter((p: any) => p.status === 'ACCEPTED'),
    SHORTLISTED: proposals.filter((p: any) => p.status === 'SHORTLISTED'),
    PENDING:     proposals.filter((p: any) => p.status === 'PENDING'),
    REJECTED:    proposals.filter((p: any) => p.status === 'REJECTED'),
    WITHDRAWN:   proposals.filter((p: any) => p.status === 'WITHDRAWN'),
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-label">My Proposals</p>
            <h1 className="font-display text-3xl text-white">
              {proposals.length} Proposal{proposals.length !== 1 ? 's' : ''}
            </h1>
          </div>
          <Link href="/jobs" className="btn-primary gap-2 text-sm">
            <Briefcase size={15} /> Browse Projects
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="card-dark p-5 animate-pulse">
                <div className="h-4 bg-surface-hover rounded w-2/3 mb-3" />
                <div className="h-3 bg-surface-hover rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <div className="card-dark p-12 text-center">
            <Send size={40} className="text-surface-border mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)] mb-2">No proposals submitted yet.</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Browse open projects and submit your first proposal.</p>
            <Link href="/jobs" className="btn-primary">Browse Projects</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([status, items]) => {
              if ((items as any[]).length === 0) return null
              return (
                <div key={status}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={cn('text-xs px-2.5 py-1 rounded-full border font-mono', STATUS_STYLES[status])}>{status}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{(items as any[]).length} proposal{(items as any[]).length !== 1 ? 's' : ''}</span>
                    <div className="h-px flex-1 bg-surface-border" />
                  </div>
                  <div className="space-y-3">
                    {(items as any[]).map((proposal: any) => (
                      <Link key={proposal.id} href={`/jobs/${proposal.jobId}`} className="group block card-dark p-5 hover:-translate-y-0.5 transition-all">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white group-hover:text-brand-400 transition-colors line-clamp-1">{proposal.job?.title}</h3>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                              {proposal.job?.discipline && DISCIPLINE_LABELS[proposal.job.discipline as keyof typeof DISCIPLINE_LABELS]}
                              {' · '}
                              {proposal.job?.clientProfile?.companyName || `${proposal.job?.clientProfile?.user?.firstName} ${proposal.job?.clientProfile?.user?.lastName}`}
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-[var(--color-text-muted)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mb-3 italic">{STATUS_DESCRIPTIONS[status]}</p>
                        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1"><DollarSign size={11} className="text-brand-400" />${proposal.proposedRate} · {proposal.estimatedDuration}</span>
                          <span className="flex items-center gap-1"><Clock size={11} />{formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}</span>
                          <span>{proposal.milestones?.length ?? 0} milestone{proposal.milestones?.length !== 1 ? 's' : ''}</span>
                        </div>
                        {status === 'ACCEPTED' && (
                          <div className="mt-3 pt-3 border-t border-surface-border">
                            <Link href={`/contracts/new?proposalId=${proposal.id}`} onClick={e => e.stopPropagation()} className="btn-primary text-xs py-2 px-4 gap-1.5">
                              Create Contract →
                            </Link>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
