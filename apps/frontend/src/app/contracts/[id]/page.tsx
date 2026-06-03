'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, CheckCircle, Clock, DollarSign,
  AlertCircle, Send, MessageSquare, Award, ChevronRight,
} from 'lucide-react'
import { useContract } from '@/hooks'
import { contractsApi, paymentsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { Navbar } from '@/components/layout/Navbar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import type { MilestoneStatus } from '@/types'

const MILESTONE_STYLES: Record<MilestoneStatus, string> = {
  PENDING:     'bg-surface-hover text-[var(--color-text-muted)] border-surface-border',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  SUBMITTED:   'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  APPROVED:    'bg-brand-500/15 text-brand-300 border-brand-500/30',
  REJECTED:    'bg-red-500/15 text-red-300 border-red-500/30',
  PAID:        'bg-green-500/15 text-green-300 border-green-500/30',
}

const MILESTONE_ICONS: Record<MilestoneStatus, any> = {
  PENDING:     Clock,
  IN_PROGRESS: Clock,
  SUBMITTED:   AlertCircle,
  APPROVED:    CheckCircle,
  REJECTED:    AlertCircle,
  PAID:        Award,
}

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const { data, isLoading, refetch } = useContract(params.id as string)

  useEffect(() => {
    if (!user) router.push('/auth/login')
  }, [user])

  if (isLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <p className="text-[var(--color-text-secondary)] mb-4">Contract not found.</p>
        <Link href="/contracts" className="btn-primary">My Contracts</Link>
      </div>
    </div>
  )

  const contract   = (data as any).data
  const isEngineer = user?.role === 'ENGINEER'
  const isClient   = user?.role === 'CLIENT'
  const milestones = contract.milestones ?? []
  const paidCount  = milestones.filter((m: any) => m.status === 'PAID').length
  const progressPct = milestones.length > 0 ? (paidCount / milestones.length) * 100 : 0

  const handleSubmitMilestone = async (milestoneId: string) => {
    try {
      await contractsApi.submitMilestone(contract.id, milestoneId, ['Deliverable submitted via InjenioRw'])
      toast.success('Milestone submitted for review!')
      refetch()
    } catch (err: any) { toast.error(err.message) }
  }

  const handleApproveMilestone = async (milestoneId: string) => {
    try {
      await contractsApi.approveMilestone(contract.id, milestoneId)
      toast.success('Milestone approved!')
      refetch()
    } catch (err: any) { toast.error(err.message) }
  }

  const handleRejectMilestone = async (milestoneId: string) => {
    const feedback = prompt('Reason for rejection (required):')
    if (!feedback) return
    try {
      await contractsApi.rejectMilestone(contract.id, milestoneId, feedback)
      toast.success('Milestone sent back for revision.')
      refetch()
    } catch (err: any) { toast.error(err.message) }
  }

  const handlePayMilestone = async (milestoneId: string) => {
    try {
      await paymentsApi.payMilestone(contract.id, milestoneId)
      toast.success('Payment initiated via MTN Mobile Money!')
      refetch()
    } catch (err: any) { toast.error(err.message) }
  }

  const counterpart = isEngineer ? contract.clientProfile : contract.engineerProfile
  const counterpartName = isEngineer
    ? (counterpart?.companyName || `${counterpart?.user?.firstName} ${counterpart?.user?.lastName}`)
    : `${counterpart?.user?.firstName} ${counterpart?.user?.lastName}`

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        <Link href="/contracts" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-white mb-8 transition-colors">
          <ChevronLeft size={14} /> All Contracts
        </Link>

        <div className="card-dark p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="font-display text-2xl text-white mb-1">{contract.title}</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {isEngineer ? 'Client:' : 'Engineer:'} <span className="text-white">{counterpartName}</span>
              </p>
            </div>
            <span className={cn('text-xs px-3 py-1.5 rounded-full border font-mono shrink-0',
              contract.status === 'ACTIVE'    ? 'bg-brand-500/15 text-brand-300 border-brand-500/30' :
              contract.status === 'COMPLETED' ? 'bg-green-500/15 text-green-300 border-green-500/30' :
                                                'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
            )}>
              {contract.status}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5 text-xs text-[var(--color-text-muted)]">
              <span>Overall progress</span>
              <span>{paidCount}/{milestones.length} milestones paid</span>
            </div>
            <div className="h-2 bg-surface-border rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-surface-hover border border-surface-border">
              <p className="font-display text-xl text-white">${Number(contract.totalAmount).toLocaleString()}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Total value</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-hover border border-surface-border">
              <p className="font-display text-xl text-brand-400">${Number(contract.paidAmount).toLocaleString()}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Paid so far</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-hover border border-surface-border">
              <p className="font-display text-xl text-earth-400">${(Number(contract.totalAmount) - Number(contract.paidAmount)).toLocaleString()}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Remaining</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="font-display text-xl text-white mb-4">Milestones</h2>
            <div className="space-y-4">
              {milestones.map((milestone: any) => {
                const Icon = MILESTONE_ICONS[milestone.status as MilestoneStatus] ?? Clock
                return (
                  <div key={milestone.id} className="card-dark p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                          milestone.status === 'PAID'      ? 'bg-green-500/20' :
                          milestone.status === 'APPROVED'  ? 'bg-brand-500/20' :
                          milestone.status === 'SUBMITTED' ? 'bg-yellow-500/20' : 'bg-surface-hover'
                        )}>
                          <Icon size={14} className={cn(
                            milestone.status === 'PAID'      ? 'text-green-400' :
                            milestone.status === 'APPROVED'  ? 'text-brand-400' :
                            milestone.status === 'SUBMITTED' ? 'text-yellow-400' : 'text-[var(--color-text-muted)]'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{milestone.title}</p>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{milestone.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display text-lg text-white">${Number(milestone.amount).toLocaleString()}</p>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border', MILESTONE_STYLES[milestone.status as MilestoneStatus])}>{milestone.status}</span>
                      </div>
                    </div>

                    {milestone.dueDate && <p className="text-xs text-[var(--color-text-muted)] mb-3">Due: {format(new Date(milestone.dueDate), 'MMM d, yyyy')}</p>}
                    {milestone.feedback && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 mb-3">Feedback: {milestone.feedback}</div>
                    )}

                    <div className="flex gap-2 mt-3">
                      {isEngineer && (milestone.status === 'PENDING' || milestone.status === 'IN_PROGRESS' || milestone.status === 'REJECTED') && (
                        <button onClick={() => handleSubmitMilestone(milestone.id)} className="btn-primary text-xs py-2 px-4 gap-1.5">
                          <Send size={12} /> Submit for Review
                        </button>
                      )}
                      {isClient && milestone.status === 'SUBMITTED' && (
                        <>
                          <button onClick={() => handleApproveMilestone(milestone.id)} className="btn-primary text-xs py-2 px-4 gap-1.5">
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button onClick={() => handleRejectMilestone(milestone.id)} className="btn-ghost text-xs py-2 px-4 gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10">
                            Request revision
                          </button>
                        </>
                      )}
                      {isClient && milestone.status === 'APPROVED' && (
                        <button onClick={() => handlePayMilestone(milestone.id)} className="btn-primary text-xs py-2 px-4 gap-1.5">
                          <DollarSign size={12} /> Release Payment (MTN MoMo)
                        </button>
                      )}
                      {milestone.status === 'PAID' && milestone.paidAt && (
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle size={11} /> Paid {format(new Date(milestone.paidAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-5">
            <div className="card-dark p-5">
              <h3 className="text-xs font-mono font-medium tracking-widest uppercase text-[var(--color-text-muted)] mb-4">Actions</h3>
              <div className="space-y-2">
                <Link href={`/contracts/${contract.id}/messages`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors group w-full">
                  <MessageSquare size={14} className="text-brand-400 shrink-0" />
                  <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-white transition-colors">Open Messages</span>
                  <ChevronRight size={12} className="text-[var(--color-text-muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link href={`/jobs/${contract.jobId}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors group w-full">
                  <ChevronRight size={14} className="text-brand-400 shrink-0" />
                  <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-white transition-colors">View Original Job</span>
                  <ChevronRight size={12} className="text-[var(--color-text-muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>

            <div className="card-dark p-5 space-y-3">
              <h3 className="text-xs font-mono font-medium tracking-widest uppercase text-[var(--color-text-muted)]">Details</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Type</span><span className="text-white">{contract.jobType}</span></div>
                <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Started</span><span className="text-white">{format(new Date(contract.startDate), 'MMM d, yyyy')}</span></div>
                {contract.completedAt && <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Completed</span><span className="text-white">{format(new Date(contract.completedAt), 'MMM d, yyyy')}</span></div>}
                <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Milestones</span><span className="text-white">{milestones.length}</span></div>
              </div>
            </div>

            {isClient && contract.status === 'ACTIVE' && paidCount === milestones.length && milestones.length > 0 && (
              <button
                onClick={async () => {
                  try {
                    await contractsApi.complete(contract.id)
                    toast.success('Contract marked as complete!')
                    refetch()
                  } catch (err: any) { toast.error(err.message) }
                }}
                className="btn-primary w-full justify-center gap-2"
              >
                <CheckCircle size={16} /> Mark Contract Complete
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
