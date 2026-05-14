'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Zap, LogOut, Settings, Bell, Star, Briefcase,
  CheckCircle2, Clock, TrendingUp, Users, MapPin,
  ArrowRight, ChevronRight, Edit3, ExternalLink,
} from 'lucide-react'
import { useAuthStore, useUser } from '@/store/auth.store'
import toast from 'react-hot-toast'

// ── Availability badge ────────────────────────────────────────────
function AvailabilityBadge({ status }: { status: string }) {
  if (status === 'AVAILABLE') return (
    <span className="badge-available px-2 py-0.5 rounded-full text-xs font-medium">Available</span>
  )
  if (status === 'BUSY') return (
    <span className="badge-busy px-2 py-0.5 rounded-full text-xs font-medium">Busy</span>
  )
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-hover text-[var(--color-text-muted)] border border-surface-border">
      Unavailable
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card-dark p-5">
      <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
      <p className="text-2xl font-display text-white">{value}</p>
      {sub && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Coming-soon feature card ──────────────────────────────────────
function FeatureCard({ icon: Icon, label, desc, phase }: {
  icon: any; label: string; desc: string; phase: number
}) {
  return (
    <div className="card-dark p-5 flex flex-col gap-3 opacity-60">
      <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center">
        <Icon size={18} className="text-[var(--color-text-muted)]" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{desc}</p>
      </div>
      <span className="text-xs text-[var(--color-text-muted)] bg-surface-hover px-2 py-0.5 rounded-full w-fit">
        Phase {phase}
      </span>
    </div>
  )
}

// ── Engineer Dashboard ────────────────────────────────────────────
function EngineerDashboard({ user }: { user: any }) {
  const profile = user.engineerProfile

  // Profile completeness score
  const checks = [
    !!profile?.headline,
    !!profile?.bio,
    (profile?.skills?.length ?? 0) > 0,
    (profile?.education?.length ?? 0) > 0,
    !!profile?.hourlyRate,
    !!profile?.momoNumber,
  ]
  const completeness = Math.round((checks.filter(Boolean).length / checks.length) * 100)

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="card-dark p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-500/20 border-2 border-brand-500/40 flex items-center justify-center shrink-0">
            <span className="text-brand-400 font-semibold text-lg">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-xl text-white">
                {user.firstName} {user.lastName}
              </h2>
              {profile?.availability && <AvailabilityBadge status={profile.availability} />}
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              {profile?.headline || 'No headline yet'}
            </p>
            {profile?.province && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                <MapPin size={11} /> {profile.province}
              </p>
            )}
          </div>
        </div>
        <Link href="/onboarding/engineer" className="btn-ghost text-sm py-2 shrink-0 flex items-center gap-2">
          <Edit3 size={14} /> Edit profile
        </Link>
      </div>

      {/* Profile completion */}
      {completeness < 100 && (
        <div className="card-dark p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">Profile completeness</p>
            <span className="text-sm font-semibold text-brand-400">{completeness}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {!profile?.headline    && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">Add headline</span>}
            {!profile?.bio         && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">Add bio</span>}
            {!profile?.skills?.length && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">Add skills</span>}
            {!profile?.hourlyRate  && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">Set hourly rate</span>}
            {!profile?.momoNumber  && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">Add MoMo number</span>}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Avg rating"
          value={profile?.avgRating ? `${profile.avgRating} ★` : '—'}
          sub={profile?.totalReviews ? `${profile.totalReviews} reviews` : 'No reviews yet'}
        />
        <StatCard
          label="Completed projects"
          value={profile?.completedProjects ?? 0}
        />
        <StatCard
          label="Hourly rate"
          value={profile?.hourlyRate ? `$${profile.hourlyRate}` : '—'}
          sub="USD / hour"
        />
        <StatCard
          label="Skills"
          value={profile?.skills?.length ?? 0}
          sub="Added to profile"
        />
      </div>

      {/* Skills preview */}
      {profile?.skills?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-white mb-3">Your skills</p>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s: any) => (
              <span
                key={s.id}
                className="px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-sm text-white"
              >
                {s.name}
                <span className="ml-1.5 text-brand-400 text-xs">{'★'.repeat(s.level)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Coming soon features */}
      <div>
        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">Coming next</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard icon={Briefcase}    label="Browse jobs"      desc="Find engineering projects to bid on"  phase={3} />
          <FeatureCard icon={TrendingUp}   label="My proposals"     desc="Track proposals you've submitted"      phase={4} />
          <FeatureCard icon={CheckCircle2} label="Active contracts" desc="Manage milestones & deliverables"       phase={4} />
        </div>
      </div>

      {/* API explorer */}
      <div className="card-dark p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">API Explorer</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Test all endpoints live in Swagger</p>
        </div>
        <a
          href="http://localhost:3001/api/docs"
          target="_blank"
          rel="noreferrer"
          className="btn-ghost py-2 text-sm flex items-center gap-2"
        >
          Open Swagger <ExternalLink size={13} />
        </a>
      </div>
    </div>
  )
}

// ── Client Dashboard ──────────────────────────────────────────────
function ClientDashboard({ user }: { user: any }) {
  const profile = user.clientProfile

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="card-dark p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand-500/20 border-2 border-brand-500/40 flex items-center justify-center shrink-0">
            <span className="text-brand-400 font-semibold text-lg">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
          <div>
            <h2 className="font-display text-xl text-white">
              {profile?.companyName || `${user.firstName} ${user.lastName}`}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              {profile?.industry || 'Client'}{profile?.companySize ? ` · ${profile.companySize} employees` : ''}
            </p>
            {profile?.website && (
              <a href={profile.website} target="_blank" rel="noreferrer"
                className="text-xs text-brand-400 hover:underline mt-1 flex items-center gap-1 w-fit">
                {profile.website} <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
        <Link href="/onboarding/client" className="btn-ghost text-sm py-2 shrink-0 flex items-center gap-2">
          <Edit3 size={14} /> Edit profile
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Jobs posted"     value={profile?.totalJobs    ?? 0} />
        <StatCard label="Total spent"     value={profile?.totalSpent   ? `$${profile.totalSpent}` : '$0'} sub="USD paid out" />
        <StatCard label="Avg rating given" value={profile?.avgRating   ? `${profile.avgRating} ★` : '—'} />
      </div>

      {/* Client profile incomplete notice */}
      {!profile?.companyName && (
        <div className="card-dark p-5 flex items-start gap-3 border-amber-500/30 bg-amber-500/5">
          <Clock size={18} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">Complete your company profile</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Engineers want to know who they're working with.
            </p>
            <Link href="/onboarding/client" className="inline-flex items-center gap-1 text-xs text-brand-400 hover:underline mt-2">
              Set up profile <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Coming soon features */}
      <div>
        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">Coming next</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard icon={Briefcase} label="Post a job"       desc="Hire Rwanda's best engineers"          phase={3} />
          <FeatureCard icon={Users}     label="Browse engineers" desc="Search by discipline & availability"    phase={3} />
          <FeatureCard icon={Star}      label="Manage contracts" desc="Milestones, deliverables & payments"    phase={4} />
        </div>
      </div>

      {/* API explorer */}
      <div className="card-dark p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">API Explorer</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Test all endpoints live in Swagger</p>
        </div>
        <a
          href="http://localhost:3001/api/docs"
          target="_blank"
          rel="noreferrer"
          className="btn-ghost py-2 text-sm flex items-center gap-2"
        >
          Open Swagger <ExternalLink size={13} />
        </a>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router   = useRouter()
  const user     = useUser()
  const { logout, initialize, isInitialized } = useAuthStore()

  useEffect(() => {
    if (!isInitialized) initialize()
  }, [isInitialized, initialize])

  useEffect(() => {
    if (isInitialized && !user) router.replace('/auth/login')
  }, [isInitialized, user, router])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <header className="bg-surface-card border-b border-surface-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <span className="font-display text-xl">
              <span className="text-white">Injenio</span>
              <span className="text-brand-400">Rw</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-[var(--color-text-muted)] hover:text-white">
              <Bell size={18} />
            </button>
            <button className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-[var(--color-text-muted)] hover:text-white">
              <Settings size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-sm text-[var(--color-text-secondary)] hover:text-white"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page title */}
        <div className="mb-8">
          <p className="section-label">Dashboard</p>
          <h1 className="font-display text-3xl text-white">
            Welcome back, {user.firstName}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {user.role === 'ENGINEER' ? 'Engineer' : 'Client'} · {user.email}
          </p>
        </div>

        {user.role === 'ENGINEER' && <EngineerDashboard user={user} />}
        {user.role === 'CLIENT'   && <ClientDashboard   user={user} />}
      </main>
    </div>
  )
}
