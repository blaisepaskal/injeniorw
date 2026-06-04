'use client'

import { useState, useEffect } from 'react'
import { Search, MoreVertical, UserX, UserCheck, Mail } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  isEmailVerified: boolean
  lastLoginAt?: string
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers]       = useState<User[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [actionMenu, setActionMenu] = useState<string | null>(null)
  const LIMIT = 20

  useEffect(() => { fetchUsers() }, [search, roleFilter, page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res: any = await api.get('/admin/users', {
        params: { search: search || undefined, role: roleFilter !== 'ALL' ? roleFilter : undefined, page, limit: LIMIT },
      })
      setUsers(res.data?.users ?? [])
      setTotal(res.data?.pagination?.total ?? 0)
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }

  const toggleActive = async (userId: string, currentlyActive: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}`, { isActive: !currentlyActive })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentlyActive } : u))
      setActionMenu(null)
    } catch {}
  }

  const ROLE_COLORS: Record<string, string> = {
    ENGINEER: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
    CLIENT:   'bg-blue-500/15 text-blue-300 border-blue-500/30',
    ADMIN:    'bg-earth-500/15 text-earth-300 border-earth-500/30',
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-white mb-1">Users</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">{total} total registered users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name or email…" className="input-dark pl-10 text-sm" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} className="input-dark text-sm min-w-[140px]">
          <option value="ALL">All roles</option>
          <option value="ENGINEER">Engineers</option>
          <option value="CLIENT">Clients</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                {['User', 'Role', 'Status', 'Verified', 'Joined', 'Last Login', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-mono font-medium text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4,5,6,7].map(j => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-hover rounded animate-pulse" /></td>)}</tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[var(--color-text-muted)]">No users found</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-300 shrink-0">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white whitespace-nowrap">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border font-mono', ROLE_COLORS[user.role] ?? '')}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border',
                        user.isActive ? 'bg-green-500/15 text-green-300 border-green-500/30' : 'bg-red-500/15 text-red-300 border-red-500/30'
                      )}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs', user.isEmailVerified ? 'text-brand-400' : 'text-[var(--color-text-muted)]')}>
                        {user.isEmailVerified ? '✓ Verified' : '✗ Unverified'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                      {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 relative">
                      <button onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)} className="p-1.5 rounded-lg hover:bg-surface-border transition-colors text-[var(--color-text-muted)] hover:text-white">
                        <MoreVertical size={14} />
                      </button>
                      {actionMenu === user.id && (
                        <div className="absolute right-4 top-10 w-44 bg-surface-card border border-surface-border rounded-xl shadow-card-hover p-1.5 z-10 animate-fade-in">
                          <button onClick={() => toggleActive(user.id, user.isActive)} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-surface-hover transition-colors">
                            {user.isActive
                              ? <><UserX size={13} className="text-red-400" /> <span className="text-red-400">Suspend</span></>
                              : <><UserCheck size={13} className="text-brand-400" /> <span className="text-brand-400">Reactivate</span></>
                            }
                          </button>
                          <a href={`mailto:${user.email}`} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-surface-hover hover:text-white transition-colors">
                            <Mail size={13} /> Email user
                          </a>
                        </div>
                      )}
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
