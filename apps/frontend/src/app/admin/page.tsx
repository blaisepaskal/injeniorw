'use client'

import { useState, useEffect } from 'react'
import {
  Users, HardHat, Briefcase, DollarSign,
  TrendingUp, Shield, Clock, CheckCircle,
  AlertCircle, Activity,
} from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface PlatformStats {
  users: { total: number; engineers: number; clients: number; newThisWeek: number }
  jobs:  { total: number; open: number; inProgress: number; completed: number }
  contracts: { total: number; active: number; completed: number; disputed: number }
  payments: { totalVolume: number; thisMonth: number; pendingPayout: number }
  engineers: { verified: number; pending: number; unverified: number }
}

function StatCard({ icon: Icon, label, value, sub, trend, color = 'brand' }: any) {
  return (
    <div className="card-dark p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
          color === 'brand' ? 'bg-brand-500/15' : color === 'earth' ? 'bg-earth-500/15' : color === 'blue' ? 'bg-blue-500/15' : 'bg-green-500/15'
        )}>
          <Icon size={18} className={cn(
            color === 'brand' ? 'text-brand-400' : color === 'earth' ? 'text-earth-400' : color === 'blue' ? 'text-blue-400' : 'text-green-400'
          )} />
        </div>
        {trend !== undefined && (
          <span className={cn('text-xs font-mono px-2 py-0.5 rounded-full',
            trend >= 0 ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30' : 'bg-red-500/15 text-red-300 border border-red-500/30'
          )}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="font-display text-3xl text-white mb-1">{value}</p>
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
      {sub && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminOverviewPage() {
  const [stats, setStats]     = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res: any = await api.get('/admin/stats')
      setStats(res.data)
    } catch {
      setStats({
        users:     { total: 0, engineers: 0, clients: 0, newThisWeek: 0 },
        jobs:      { total: 0, open: 0, inProgress: 0, completed: 0 },
        contracts: { total: 0, active: 0, completed: 0, disputed: 0 },
        payments:  { totalVolume: 0, thisMonth: 0, pendingPayout: 0 },
        engineers: { verified: 0, pending: 0, unverified: 0 },
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="card-dark p-5 animate-pulse">
            <div className="w-10 h-10 bg-surface-hover rounded-xl mb-4" />
            <div className="h-8 bg-surface-hover rounded w-1/2 mb-2" />
            <div className="h-3 bg-surface-hover rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white mb-1">Platform Overview</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">InjenioRw — {format(new Date(), 'EEEE, MMMM d yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}    label="Total Users"     value={stats?.users.total.toLocaleString() ?? '0'}    sub={`+${stats?.users.newThisWeek ?? 0} this week`} color="brand" trend={stats?.users.newThisWeek ?? 0} />
        <StatCard icon={HardHat}  label="Engineers"       value={stats?.users.engineers.toLocaleString() ?? '0'} sub={`${stats?.engineers.verified ?? 0} verified`}    color="brand" />
        <StatCard icon={Briefcase} label="Open Projects"  value={stats?.jobs.open.toLocaleString() ?? '0'}      sub={`${stats?.jobs.inProgress ?? 0} in progress`}    color="blue" />
        <StatCard icon={Activity} label="Active Contracts" value={stats?.contracts.active.toLocaleString() ?? '0'} sub={`${stats?.contracts.completed ?? 0} completed`} color="green" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={DollarSign}  label="Total Platform Volume" value={`$${(stats?.payments.totalVolume ?? 0).toLocaleString()}`} sub="All-time payments processed" color="earth" />
        <StatCard icon={TrendingUp}  label="This Month"            value={`$${(stats?.payments.thisMonth ?? 0).toLocaleString()}`}   sub="Revenue this calendar month" color="earth" />
        <StatCard icon={Clock}       label="Pending Payouts"       value={`$${(stats?.payments.pendingPayout ?? 0).toLocaleString()}`} sub="Approved, awaiting payment" color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-white">Verification Queue</h2>
            <a href="/admin/engineers?filter=pending" className="text-xs text-brand-400 hover:text-brand-300">View all →</a>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Pending Review', sub: 'Awaiting manual verification', value: stats?.engineers.pending ?? 0, icon: AlertCircle, color: 'text-yellow-400 bg-yellow-500/15' },
              { label: 'Verified Engineers', sub: 'Badge shown on profile', value: stats?.engineers.verified ?? 0, icon: CheckCircle, color: 'text-brand-400 bg-brand-500/15' },
              { label: 'Unverified', sub: 'No badge yet', value: stats?.engineers.unverified ?? 0, icon: Shield, color: 'text-[var(--color-text-muted)] bg-surface-card' },
            ].map(({ label, sub, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-surface-hover border border-surface-border">
                <div className="flex items-center gap-2">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color.split(' ')[1])}>
                    <Icon size={14} className={color.split(' ')[0]} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{sub}</p>
                  </div>
                </div>
                <span className="font-display text-2xl text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-dark p-5">
          <h2 className="font-display text-lg text-white mb-4">Platform Health</h2>
          <div className="space-y-3">
            {[
              {
                label: 'Jobs filling rate',
                value: stats?.jobs.total ? Math.round((stats.jobs.inProgress + stats.jobs.completed) / stats.jobs.total * 100) : 0,
                color: 'bg-brand-500',
              },
              {
                label: 'Contract completion rate',
                value: stats?.contracts.total ? Math.round(stats.contracts.completed / stats.contracts.total * 100) : 0,
                color: 'bg-green-500',
              },
              {
                label: 'Dispute rate',
                value: stats?.contracts.total ? Math.round(stats.contracts.disputed / stats.contracts.total * 100) : 0,
                color: 'bg-red-500',
              },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
                  <span className="text-sm font-semibold text-white">{value}%</span>
                </div>
                <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${Math.min(value, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          {(stats?.contracts.disputed ?? 0) > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-300">
                {stats?.contracts.disputed} disputed contract{stats?.contracts.disputed !== 1 ? 's' : ''} need attention.
              </p>
              <a href="/admin/contracts?filter=disputed" className="text-xs text-red-400 underline ml-auto shrink-0">Review →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
