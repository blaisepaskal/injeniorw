'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Briefcase, Star, DollarSign, Clock, ChevronRight,
  Edit, Eye, Send, CheckCircle, AlertCircle, PlusCircle,
} from 'lucide-react'
import { useMyEngineerProfile, useMyProposals, useMyContracts } from '@/hooks'
import { useAuthStore } from '@/store/auth.store'
import { DISCIPLINE_LABELS } from '@/types'
import { Navbar } from '@/components/layout/Navbar'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const STATUS_STYLES: Record<string, string> = {
  PENDING:     'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  SHORTLISTED: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  ACCEPTED:    'bg-brand-500/15 text-brand-300 border-brand-500/30',
  REJECTED:    'bg-red-500/15 text-red-300 border-red-500/30',
  WITHDRAWN:   'bg-surface-hover text-[var(--color-text-muted)] border-surface-border',
  ACTIVE:      'bg-brand-500/15 text-brand-300 border-brand-500/30',
  COMPLETED:   'bg-green-500/15 text-green-300 border-green-500/30',
  PAUSED:      'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
}

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }: any) {
  return (
    <div className="card-dark p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
          color === 'brand' ? 'bg-brand-500/15' : color === 'earth' ? 'bg-earth-500/15' : 'bg-blue-500/15'
        )}>
          <Icon size={18} className={cn(color === 'brand' ? 'text-brand-400' : color === 'earth' ? 'text-earth-400' : 'text-blue-400')} />
        </div>
      </div>
      <p className="font-display text-2xl text-white mb-0.5">{value}</p>
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
      {sub && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</p>}
    </div>
  )
}

export default function EngineerDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()

  const { data: profileData, isLoading: profileLoading } = useMyEngineerProfile()
  const { data: proposalsData } = useMyProposals()
  const { data: contractsData } = useMyContracts()

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    if (user.role !== 'ENGINEER') { router.push('/dashboard/client') }
  }, [user])

  const profile   = (profileData as any)?.data
  const proposals = (proposalsData as any)?.data ?? []
  const contracts = (contractsData as any)?.data ?? []

  const activeContracts  = contracts.filter((c: any) => c.status === 'ACTIVE')
  const pendingProposals = proposals.filter((p: any) => p.status === 'PENDING')

  const completenessChecks = [
    !!profile?.headline,
    !!profile?.bio,
    (profile?.skills?.length ?? 0) >= 3,
    (profile?.portfolio?.length ?? 0) >= 1,
    !!profile?.momoNumber,
    !!profile?.hourlyRate,
  ]
  const completeness = Math.round((completenessChecks.filter(Boolean).length / completenessChecks.length) * 100)

  if (profileLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  )

  if (!profile && !profileLoading) {
    router.push('/onboarding/engineer')
    return null
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="section-label">Engineer Dashboard</p>
            <h1 className="font-display text-3xl text-white">Welcome back, {user?.firstName} 👋</h1>
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
              {profile?.availability === 'AVAILABLE' ? "You're available for new projects." : "You're currently marked as busy."}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/jobs" className="btn-ghost gap-2 text-sm"><Briefcase size={15} /> Browse Projects</Link>
            <Link href="/engineers/me/edit" className="btn-primary gap-2 text-sm"><Edit size={15} /> Edit Profile</Link>
          </div>
        </div>

        {completeness < 100 && (
          <div className="mb-6 p-4 rounded-2xl border border-earth-500/30 bg-earth-500/5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={15} className="text-earth-400" />
                <span className="text-sm font-medium text-white">Profile {completeness}% complete</span>
              </div>
              <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                <div className="h-full bg-earth-500 rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                Complete your profile to rank higher in search results.
                {!profile?.headline && ' Add a headline.'}
                {!profile?.bio && ' Write a bio.'}
                {(profile?.skills?.length ?? 0) < 3 && ' Add more skills.'}
                {!profile?.momoNumber && ' Add your MTN MoMo number.'}
              </p>
            </div>
            <Link href="/engineers/me/edit" className="btn-ghost text-sm shrink-0 py-2">Complete Profile →</Link>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Briefcase}   label="Active Contracts"  value={activeContracts.length}              color="brand" />
          <StatCard icon={Send}        label="Pending Proposals" value={pendingProposals.length}             color="blue" />
          <StatCard icon={Star}        label="Avg Rating"        value={profile?.avgRating?.toFixed(1) ?? '—'} sub={`${profile?.totalReviews ?? 0} reviews`} color="earth" />
          <StatCard icon={CheckCircle} label="Completed Jobs"    value={profile?.completedProjects ?? 0}     color="brand" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-white">Active Contracts</h2>
              <Link href="/contracts" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">View all <ChevronRight size={12} /></Link>
            </div>

            {activeContracts.length === 0 ? (
              <div className="card-dark p-8 text-center">
                <Briefcase size={32} className="text-surface-border mx-auto mb-3" />
                <p className="text-[var(--color-text-secondary)] mb-4">No active contracts yet.</p>
                <Link href="/jobs" className="btn-primary text-sm">Browse Projects</Link>
              </div>
            ) : (
              activeContracts.slice(0, 4).map((contract: any) => {
                const milestones    = contract.milestones ?? []
                const paid          = milestones.filter((m: any) => m.status === 'PAID').length
                const total         = milestones.length
                const nextMilestone = milestones.find((m: any) => m.status === 'IN_PROGRESS' || m.status === 'PENDING')
                return (
                  <Link key={contract.id} href={`/contracts/${contract.id}`} className="block card-dark p-5 hover:-translate-y-0.5 transition-transform">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-medium text-white text-sm line-clamp-1">{contract.title}</h3>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                          {contract.clientProfile?.companyName || `${contract.clientProfile?.user?.firstName} ${contract.clientProfile?.user?.lastName}`}
                        </p>
                      </div>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border shrink-0', STATUS_STYLES[contract.status])}>{contract.status}</span>
                    </div>
                    {total > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[var(--color-text-muted)]">Milestones</span>
                          <span className="text-xs text-[var(--color-text-muted)]">{paid}/{total} paid</span>
                        </div>
                        <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: total > 0 ? `${(paid / total) * 100}%` : '0%' }} />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1"><DollarSign size={11} /> ${Number(contract.totalAmount).toLocaleString()} total</span>
                      {nextMilestone && <span className="text-brand-400">Next: {nextMilestone.title}</span>}
                    </div>
                  </Link>
                )
              })
            )}

            <div className="flex items-center justify-between mt-6">
              <h2 className="font-display text-xl text-white">Recent Proposals</h2>
              <Link href="/proposals" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">View all <ChevronRight size={12} /></Link>
            </div>

            {proposals.length === 0 ? (
              <div className="card-dark p-8 text-center">
                <Send size={32} className="text-surface-border mx-auto mb-3" />
                <p className="text-[var(--color-text-secondary)] mb-4">You haven't submitted any proposals yet.</p>
                <Link href="/jobs" className="btn-primary text-sm">Find Projects</Link>
              </div>
            ) : (
              proposals.slice(0, 5).map((proposal: any) => (
                <Link key={proposal.id} href={`/jobs/${proposal.jobId}`} className="block card-dark p-4 hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white text-sm line-clamp-1">{proposal.job?.title}</h3>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {DISCIPLINE_LABELS[proposal.job?.discipline]} · {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border shrink-0', STATUS_STYLES[proposal.status])}>{proposal.status}</span>
                  </div>
                  <div className="mt-2 text-xs text-[var(--color-text-muted)]">Proposed: ${proposal.proposedRate} · {proposal.estimatedDuration}</div>
                </Link>
              ))
            )}
          </div>

          <div className="space-y-5">
            <div className="card-dark p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center font-display text-brand-300 font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">{profile?.headline || DISCIPLINE_LABELS[profile?.discipline]}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-[var(--color-text-secondary)] mb-4">
                <div className="flex justify-between"><span>Discipline</span><span className="text-white">{DISCIPLINE_LABELS[profile?.discipline]}</span></div>
                <div className="flex justify-between"><span>Rate</span><span className="text-white">{profile?.hourlyRate ? `$${profile.hourlyRate}/hr` : 'Not set'}</span></div>
                <div className="flex justify-between"><span>Rating</span><span className="text-white">{profile?.avgRating?.toFixed(1) ?? '—'} ★</span></div>
              </div>
              <div className="flex gap-2">
                <Link href={`/engineers/${profile?.id}`} className="btn-ghost flex-1 text-xs py-2 gap-1.5 justify-center"><Eye size={12} /> View Profile</Link>
                <Link href="/engineers/me/edit" className="btn-primary flex-1 text-xs py-2 gap-1.5 justify-center"><Edit size={12} /> Edit</Link>
              </div>
            </div>

            <div className="card-dark p-5">
              <h3 className="text-xs font-mono font-medium tracking-widest uppercase text-[var(--color-text-muted)] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Browse open projects',  href: '/jobs',                         icon: Briefcase },
                  { label: 'Update availability',   href: '/engineers/me/edit',            icon: Clock },
                  { label: 'Add portfolio item',    href: '/engineers/me/edit#portfolio',  icon: PlusCircle },
                  { label: 'View public profile',   href: `/engineers/${profile?.id}`,     icon: Eye },
                ].map(({ label, href, icon: Icon }) => (
                  <Link key={label} href={href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-hover transition-colors group">
                    <Icon size={14} className="text-brand-400 shrink-0" />
                    <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-white transition-colors">{label}</span>
                    <ChevronRight size={12} className="text-[var(--color-text-muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
