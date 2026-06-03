'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Briefcase, Users, DollarSign, Clock,
  ChevronRight, PlusCircle, Eye, Edit,
  CheckCircle, AlertCircle, FileText,
} from 'lucide-react'
import { useMyJobs, useMyContracts } from '@/hooks'
import { useAuthStore } from '@/store/auth.store'
import { DISCIPLINE_LABELS } from '@/types'
import { Navbar } from '@/components/layout/Navbar'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const JOB_STATUS_STYLES: Record<string, string> = {
  OPEN:        'bg-brand-500/15 text-brand-300 border-brand-500/30',
  DRAFT:       'bg-surface-hover text-[var(--color-text-muted)] border-surface-border',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  COMPLETED:   'bg-green-500/15 text-green-300 border-green-500/30',
  CANCELLED:   'bg-red-500/15 text-red-300 border-red-500/30',
}

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }: any) {
  return (
    <div className="card-dark p-5">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3',
        color === 'brand' ? 'bg-brand-500/15' : color === 'earth' ? 'bg-earth-500/15' : 'bg-blue-500/15'
      )}>
        <Icon size={18} className={cn(color === 'brand' ? 'text-brand-400' : color === 'earth' ? 'text-earth-400' : 'text-blue-400')} />
      </div>
      <p className="font-display text-2xl text-white mb-0.5">{value}</p>
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
      {sub && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</p>}
    </div>
  )
}

export default function ClientDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()

  const { data: jobsData }      = useMyJobs()
  const { data: contractsData } = useMyContracts()

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    if (user.role !== 'CLIENT') router.push('/dashboard/engineer')
  }, [user])

  const jobs            = (jobsData as any)?.data ?? []
  const contracts       = (contractsData as any)?.data ?? []
  const openJobs        = jobs.filter((j: any) => j.status === 'OPEN')
  const activeContracts = contracts.filter((c: any) => c.status === 'ACTIVE')
  const totalSpent      = contracts.reduce((sum: number, c: any) => sum + Number(c.paidAmount ?? 0), 0)

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="section-label">Client Dashboard</p>
            <h1 className="font-display text-3xl text-white">Welcome back, {user?.firstName} 👋</h1>
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">Manage your projects and contracts.</p>
          </div>
          <Link href="/jobs/post" className="btn-primary gap-2">
            <PlusCircle size={16} /> Post a Project
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Briefcase}   label="Open Projects"    value={openJobs.length}        color="brand" />
          <StatCard icon={FileText}    label="Active Contracts" value={activeContracts.length} color="blue" />
          <StatCard icon={DollarSign}  label="Total Spent"      value={`$${totalSpent.toLocaleString()}`} sub="via MTN MoMo" color="earth" />
          <StatCard icon={CheckCircle} label="Total Projects"   value={jobs.length}            color="brand" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-white">My Projects</h2>
              <Link href="/jobs/post" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                <PlusCircle size={12} /> New project
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="card-dark p-8 text-center">
                <Briefcase size={32} className="text-surface-border mx-auto mb-3" />
                <p className="text-[var(--color-text-secondary)] mb-2">No projects posted yet.</p>
                <p className="text-sm text-[var(--color-text-muted)] mb-5">Post your first project to start receiving proposals from Rwanda's top engineers.</p>
                <Link href="/jobs/post" className="btn-primary text-sm">Post Your First Project</Link>
              </div>
            ) : (
              jobs.slice(0, 6).map((job: any) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block card-dark p-5 hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white text-sm line-clamp-1">{job.title}</h3>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {DISCIPLINE_LABELS[job.discipline]} · {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border shrink-0', JOB_STATUS_STYLES[job.status])}>{job.status}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1"><Users size={11} /> {job._count?.proposals ?? 0} proposals</span>
                    <span className="flex items-center gap-1"><Eye size={11} /> {job.viewCount} views</span>
                    <span className="ml-auto text-brand-400 flex items-center gap-1">View proposals <ChevronRight size={11} /></span>
                  </div>
                </Link>
              ))
            )}

            {activeContracts.length > 0 && (
              <>
                <div className="flex items-center justify-between mt-4">
                  <h2 className="font-display text-xl text-white">Active Contracts</h2>
                  <Link href="/contracts" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">View all <ChevronRight size={12} /></Link>
                </div>
                {activeContracts.slice(0, 3).map((contract: any) => {
                  const milestones = contract.milestones ?? []
                  const submitted  = milestones.filter((m: any) => m.status === 'SUBMITTED')
                  return (
                    <Link key={contract.id} href={`/contracts/${contract.id}`} className="block card-dark p-5 hover:-translate-y-0.5 transition-transform">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-medium text-white text-sm">{contract.title}</h3>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                            {contract.engineerProfile?.user?.firstName} {contract.engineerProfile?.user?.lastName}
                          </p>
                        </div>
                        {submitted.length > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 shrink-0 flex items-center gap-1">
                            <AlertCircle size={10} /> {submitted.length} awaiting review
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                        <span>${Number(contract.paidAmount).toLocaleString()} paid of ${Number(contract.totalAmount).toLocaleString()}</span>
                        <span className="text-brand-400">View contract →</span>
                      </div>
                    </Link>
                  )
                })}
              </>
            )}
          </div>

          <div className="space-y-5">
            <div className="card-dark p-5">
              <h3 className="text-xs font-mono font-medium tracking-widest uppercase text-[var(--color-text-muted)] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Post a new project',    href: '/jobs/post',       icon: PlusCircle },
                  { label: 'Browse engineers',       href: '/engineers',       icon: Users },
                  { label: 'View my contracts',      href: '/contracts',       icon: FileText },
                  { label: 'Update company profile', href: '/clients/me/edit', icon: Edit },
                ].map(({ label, href, icon: Icon }) => (
                  <Link key={label} href={href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-hover transition-colors group">
                    <Icon size={14} className="text-brand-400 shrink-0" />
                    <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-white transition-colors">{label}</span>
                    <ChevronRight size={12} className="text-[var(--color-text-muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="card-dark p-5 border-brand-500/20">
              <h3 className="text-xs font-mono font-medium tracking-widest uppercase text-brand-400 mb-4">How InjenioRw Works</h3>
              <ol className="space-y-3">
                {[
                  'Post your engineering project with a budget',
                  'Receive proposals from verified engineers',
                  'Hire and create a milestone contract',
                  'Pay securely via MTN Mobile Money',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-[var(--color-text-secondary)]">
                    <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
