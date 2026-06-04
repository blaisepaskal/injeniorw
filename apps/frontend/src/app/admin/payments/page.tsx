'use client'

import { useState, useEffect } from 'react'
import { Search, DollarSign, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const STATUS_STYLES: Record<string, string> = {
  PENDING:    'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  PROCESSING: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  COMPLETED:  'bg-green-500/15 text-green-300 border-green-500/30',
  FAILED:     'bg-red-500/15 text-red-300 border-red-500/30',
  REFUNDED:   'bg-surface-hover text-[var(--color-text-muted)] border-surface-border',
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('ALL')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [summary, setSummary]   = useState({ totalVolume: 0, platformRevenue: 0, engineerPayouts: 0 })
  const LIMIT = 20

  useEffect(() => { fetchPayments() }, [search, status, page])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const res: any = await api.get('/admin/payments', {
        params: { search: search || undefined, status: status !== 'ALL' ? status : undefined, page, limit: LIMIT },
      })
      setPayments(res.data?.payments ?? [])
      setTotal(res.data?.pagination?.total ?? 0)
      if (res.data?.summary) setSummary(res.data.summary)
    } catch { setPayments([]) }
    finally { setLoading(false) }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-white mb-1">Payments</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">All MTN Mobile Money transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Volume', value: summary.totalVolume, icon: DollarSign, color: 'earth' },
          { label: 'Platform Revenue (8%)', value: summary.platformRevenue, icon: TrendingUp, color: 'brand' },
          { label: 'Engineer Payouts', value: summary.engineerPayouts, icon: DollarSign, color: 'green' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-dark p-5">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3',
              color === 'earth' ? 'bg-earth-500/15' : color === 'brand' ? 'bg-brand-500/15' : 'bg-green-500/15'
            )}>
              <Icon size={16} className={color === 'earth' ? 'text-earth-400' : color === 'brand' ? 'text-brand-400' : 'text-green-400'} />
            </div>
            <p className="font-display text-2xl text-white">${value.toLocaleString()}</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by reference or engineer…" className="input-dark pl-10 text-sm" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input-dark text-sm min-w-[140px]">
          {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'].map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</option>
          ))}
        </select>
      </div>

      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                {['Reference', 'Contract', 'Amount', 'Platform Fee', 'Net Payout', 'Method', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-mono font-medium text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4,5,6,7,8].map(j => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-hover rounded animate-pulse" /></td>)}</tr>
                ))
              ) : payments.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[var(--color-text-muted)]">No payments found</td></tr>
              ) : (
                payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-[var(--color-text-muted)] whitespace-nowrap">
                      {payment.momoReference ? payment.momoReference.slice(0, 12) + '…' : payment.id.slice(0, 8) + '…'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)] whitespace-nowrap max-w-[140px] truncate">{payment.contract?.title ?? '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">${Number(payment.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-earth-400 whitespace-nowrap">${Number(payment.platformFee).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-brand-400 whitespace-nowrap">${Number(payment.netAmount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">{payment.method?.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', STATUS_STYLES[payment.status] ?? '')}>{payment.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">{format(new Date(payment.createdAt), 'MMM d, HH:mm')}</td>
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
