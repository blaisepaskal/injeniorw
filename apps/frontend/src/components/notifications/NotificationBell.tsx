'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Briefcase, MessageSquare, DollarSign, Star, Zap } from 'lucide-react'
import { notificationsApi } from '@/lib/api'
import { useNotificationSocket } from '@/hooks/useMessaging'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
  data?: any
}

const ICONS: Record<string, any> = {
  PROPOSAL_RECEIVED: Briefcase,
  PROPOSAL_ACCEPTED: Briefcase,
  CONTRACT_STARTED:  Zap,
  MILESTONE_SUBMITTED: Briefcase,
  MILESTONE_APPROVED: CheckCheck,
  PAYMENT_RECEIVED:  DollarSign,
  MESSAGE_RECEIVED:  MessageSquare,
  REVIEW_RECEIVED:   Star,
}

export function NotificationBell() {
  const [open, setOpen]               = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]         = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useNotificationSocket((notification) => {
    setUnreadCount(prev => prev + 1)
    setNotifications(prev => [notification, ...prev].slice(0, 20))
  })

  const fetchUnreadCount = async () => {
    try {
      const res: any = await notificationsApi.unread()
      setUnreadCount(typeof res.data === 'number' ? res.data : 0)
    } catch { /* not logged in yet */ }
  }

  const fetchNotifications = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res: any = await notificationsApi.list()
      setNotifications(res.data ?? [])
    } catch { /* fail silently */ }
    finally { setLoading(false) }
  }

  const handleOpen = () => {
    setOpen(prev => {
      if (!prev) fetchNotifications()
      return !prev
    })
  }

  const markAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await notificationsApi.markAll()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch { /* fail silently */ }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationsApi.markRead(notification.id)
        setUnreadCount(prev => Math.max(0, prev - 1))
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        )
      } catch { /* fail silently */ }
    }
    setOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-hover transition-colors text-[var(--color-text-secondary)] hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-brand-500 text-white text-[10px] font-mono font-bold flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-surface-card border border-surface-border rounded-2xl shadow-card-hover overflow-hidden z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
            <h3 className="font-medium text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-xl bg-surface-hover shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-surface-hover rounded w-3/4" />
                      <div className="h-2.5 bg-surface-hover rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={28} className="text-surface-border mx-auto mb-2" />
                <p className="text-sm text-[var(--color-text-muted)]">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(notification => {
                const Icon = ICONS[notification.type] ?? Bell
                return (
                  <Link
                    key={notification.id}
                    href={notification.data?.contractId ? `/contracts/${notification.data.contractId}` : '/notifications'}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 hover:bg-surface-hover transition-colors border-b border-surface-border/50 last:border-0',
                      !notification.isRead && 'bg-brand-500/5'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                      notification.isRead ? 'bg-surface-hover' : 'bg-brand-500/15'
                    )}>
                      <Icon size={14} className={notification.isRead ? 'text-[var(--color-text-muted)]' : 'text-brand-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-medium leading-snug',
                        notification.isRead ? 'text-[var(--color-text-secondary)]' : 'text-white'
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2 leading-relaxed">{notification.body}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-2" />}
                  </Link>
                )
              })
            )}
          </div>

          <div className="border-t border-surface-border">
            <Link href="/notifications" onClick={() => setOpen(false)} className="block text-center text-xs text-brand-400 hover:text-brand-300 py-3 transition-colors">
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
