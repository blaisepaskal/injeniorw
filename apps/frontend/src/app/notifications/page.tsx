'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Bell, CheckCheck, Briefcase, MessageSquare,
  DollarSign, Star, Shield, Zap,
} from 'lucide-react'
import { notificationsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  data?: any
  createdAt: string
}

const NOTIFICATION_ICONS: Record<string, any> = {
  PROPOSAL_RECEIVED:   Briefcase,
  PROPOSAL_ACCEPTED:   Briefcase,
  PROPOSAL_REJECTED:   Briefcase,
  CONTRACT_STARTED:    Zap,
  CONTRACT_COMPLETED:  Zap,
  MILESTONE_SUBMITTED: Briefcase,
  MILESTONE_APPROVED:  CheckCheck,
  MILESTONE_REJECTED:  Briefcase,
  PAYMENT_RECEIVED:    DollarSign,
  PAYMENT_SENT:        DollarSign,
  MESSAGE_RECEIVED:    MessageSquare,
  REVIEW_RECEIVED:     Star,
  PROFILE_VERIFIED:    Shield,
  JOB_POSTED:          Briefcase,
  NEW_MATCH:           Zap,
}

const NOTIFICATION_COLORS: Record<string, string> = {
  PROPOSAL_RECEIVED:   'text-brand-400 bg-brand-500/10',
  PROPOSAL_ACCEPTED:   'text-green-400 bg-green-500/10',
  PROPOSAL_REJECTED:   'text-red-400 bg-red-500/10',
  CONTRACT_STARTED:    'text-brand-400 bg-brand-500/10',
  CONTRACT_COMPLETED:  'text-green-400 bg-green-500/10',
  MILESTONE_SUBMITTED: 'text-yellow-400 bg-yellow-500/10',
  MILESTONE_APPROVED:  'text-green-400 bg-green-500/10',
  MILESTONE_REJECTED:  'text-red-400 bg-red-500/10',
  PAYMENT_RECEIVED:    'text-earth-400 bg-earth-500/10',
  PAYMENT_SENT:        'text-earth-400 bg-earth-500/10',
  MESSAGE_RECEIVED:    'text-blue-400 bg-blue-500/10',
  REVIEW_RECEIVED:     'text-yellow-400 bg-yellow-500/10',
  PROFILE_VERIFIED:    'text-brand-400 bg-brand-500/10',
}

function getNotificationLink(notification: Notification): string {
  const data = notification.data || {}
  switch (notification.type) {
    case 'PROPOSAL_RECEIVED':
    case 'PROPOSAL_ACCEPTED':
    case 'PROPOSAL_REJECTED':
      return data.jobId ? `/jobs/${data.jobId}` : '/proposals'
    case 'CONTRACT_STARTED':
    case 'CONTRACT_COMPLETED':
    case 'MILESTONE_SUBMITTED':
    case 'MILESTONE_APPROVED':
    case 'MILESTONE_REJECTED':
      return data.contractId ? `/contracts/${data.contractId}` : '/contracts'
    case 'PAYMENT_RECEIVED':
    case 'PAYMENT_SENT':
      return data.contractId ? `/contracts/${data.contractId}` : '/contracts'
    case 'MESSAGE_RECEIVED':
      return data.contractId ? `/contracts/${data.contractId}/messages` : '/contracts'
    case 'REVIEW_RECEIVED':
      return '/dashboard/engineer'
    case 'PROFILE_VERIFIED':
      return '/engineers/me/edit'
    default:
      return '/'
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [filter, setFilter]               = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const res: any = await notificationsApi.list()
      setNotifications(res.data ?? [])
    } catch { /* fail silently */ }
    finally { setIsLoading(false) }
  }

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch { /* fail silently */ }
  }

  const markAllRead = async () => {
    try {
      await notificationsApi.markAll()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch { /* fail silently */ }
  }

  const displayed   = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-label">Notifications</p>
            <h1 className="font-display text-3xl text-white flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="text-base font-body font-medium px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
                  {unreadCount} new
                </span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-ghost text-sm gap-2 py-2">
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
        </div>

        <div className="flex gap-1 mb-6 bg-surface-card p-1 rounded-2xl border border-surface-border w-fit">
          {(['all', 'unread'] as const).map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={cn('px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all',
                filter === tab ? 'bg-brand-500 text-white' : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-surface-hover'
              )}>
              {tab}
              {tab === 'unread' && unreadCount > 0 && <span className="ml-1.5 text-xs">{unreadCount}</span>}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="card-dark p-4 animate-pulse flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-hover shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-hover rounded w-3/4" />
                  <div className="h-3 bg-surface-hover rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="card-dark p-12 text-center">
            <Bell size={40} className="text-surface-border mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)] mb-1">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              You'll be notified about proposals, contracts, payments and messages here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map(notification => {
              const Icon  = NOTIFICATION_ICONS[notification.type] ?? Bell
              const color = NOTIFICATION_COLORS[notification.type] ?? 'text-brand-400 bg-brand-500/10'
              const href  = getNotificationLink(notification)

              return (
                <Link
                  key={notification.id}
                  href={href}
                  onClick={() => !notification.isRead && markRead(notification.id)}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 group',
                    notification.isRead
                      ? 'border-surface-border bg-surface-card hover:border-brand-500/20 hover:bg-surface-hover'
                      : 'border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/10'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5', color.split(' ')[1])}>
                    <Icon size={18} className={color.split(' ')[0]} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-medium leading-snug',
                        notification.isRead ? 'text-[var(--color-text-secondary)]' : 'text-white'
                      )}>
                        {notification.title}
                      </p>
                      {!notification.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{notification.body}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
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
