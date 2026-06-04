'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Send, ChevronLeft, Wifi, WifiOff,
  CheckCheck,
} from 'lucide-react'
import { useMessaging } from '@/hooks/useMessaging'
import { messagesApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { useContract } from '@/hooks'
import { Navbar } from '@/components/layout/Navbar'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday } from 'date-fns'

interface Message {
  id: string
  senderId: string
  content: string
  type: string
  isRead: boolean
  createdAt: string
  sender: { id: string; firstName: string; lastName: string; avatarUrl?: string }
}

function formatMessageTime(date: string) {
  const d = new Date(date)
  if (isToday(d))     return format(d, 'HH:mm')
  if (isYesterday(d)) return `Yesterday ${format(d, 'HH:mm')}`
  return format(d, 'MMM d, HH:mm')
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = []
  messages.forEach(msg => {
    const d    = new Date(msg.createdAt)
    const key  = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy')
    const last = groups[groups.length - 1]
    if (last && last.date === key) {
      last.messages.push(msg)
    } else {
      groups.push({ date: key, messages: [msg] })
    }
  })
  return groups
}

export default function ContractMessagesPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const contractId = params.id as string

  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const { data: contractData } = useContract(contractId)
  const contract = (contractData as any)?.data

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    loadMessages()
  }, [contractId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const res: any = await messagesApi.get(contractId)
      setMessages(res.data ?? [])
      messagesApi.markRead(contractId).catch(() => {})
    } catch {
      // silently fail — messages may not exist yet
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => {
      if (prev.find(m => m.id === message.id)) return prev
      return [...prev, message]
    })
    if (message.senderId !== user?.id) {
      messagesApi.markRead(contractId).catch(() => {})
    }
  }, [contractId, user?.id])

  const { isConnected, isConnecting, sendMessage, markRead } = useMessaging({
    contractId,
    onNewMessage: handleNewMessage,
  })

  const handleSend = async () => {
    const content = input.trim()
    if (!content || isSending) return

    setIsSending(true)
    setInput('')

    const optimistic: Message = {
      id:        `optimistic-${Date.now()}`,
      senderId:  user!.id,
      content,
      type:      'TEXT',
      isRead:    false,
      createdAt: new Date().toISOString(),
      sender: { id: user!.id, firstName: user!.firstName, lastName: user!.lastName },
    }
    setMessages(prev => [...prev, optimistic])

    const sent = sendMessage(content)

    if (!sent) {
      try {
        const res: any = await messagesApi.send(contractId, content)
        setMessages(prev => prev.map(m => m.id === optimistic.id ? res.data : m))
      } catch {
        setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      }
    } else {
      setTimeout(() => {
        setMessages(prev => prev.filter(m => !m.id.startsWith('optimistic-')))
      }, 2000)
    }

    setIsSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const counterpartName = (() => {
    if (!contract || !user) return 'Loading…'
    if (user.role === 'ENGINEER') {
      const c = contract.clientProfile
      return c?.companyName || `${c?.user?.firstName} ${c?.user?.lastName}`
    }
    const e = contract.engineerProfile
    return `${e?.user?.firstName} ${e?.user?.lastName}`
  })()

  const groups = groupMessagesByDate(messages)

  return (
    <div className="h-screen bg-surface flex flex-col">
      <Navbar />

      <div className="flex items-center gap-3 px-4 sm:px-6 h-16 mt-16 border-b border-surface-border bg-surface-card shrink-0">
        <Link href={`/contracts/${contractId}`} className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-[var(--color-text-muted)] hover:text-white">
          <ChevronLeft size={18} />
        </Link>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-300 shrink-0">
            {counterpartName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-white text-sm truncate">{counterpartName}</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{contract?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isConnecting ? (
            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Connecting
            </span>
          ) : isConnected ? (
            <span className="text-xs text-brand-400 flex items-center gap-1"><Wifi size={12} /> Live</span>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1"><WifiOff size={12} /> Offline</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-3xl bg-surface-card border border-surface-border flex items-center justify-center mb-4">
              <Send size={20} className="text-[var(--color-text-muted)]" />
            </div>
            <p className="text-[var(--color-text-secondary)] font-medium mb-1">No messages yet</p>
            <p className="text-sm text-[var(--color-text-muted)]">Start the conversation with {counterpartName}.</p>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-surface-border" />
                <span className="text-xs text-[var(--color-text-muted)] font-mono px-2">{group.date}</span>
                <div className="h-px flex-1 bg-surface-border" />
              </div>

              <div className="space-y-2">
                {group.messages.map((msg, index) => {
                  const isOwn       = msg.senderId === user?.id
                  const prevMsg     = group.messages[index - 1]
                  const showMeta    = !prevMsg || prevMsg.senderId !== msg.senderId
                  const isOptimistic = msg.id.startsWith('optimistic-')

                  return (
                    <div key={msg.id} className={cn('flex items-end gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}>
                      {!isOwn && (
                        <div className={cn('w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold',
                          showMeta ? 'bg-brand-500/20 border border-brand-500/30 text-brand-300' : 'opacity-0'
                        )}>
                          {msg.sender.firstName[0]}{msg.sender.lastName[0]}
                        </div>
                      )}

                      <div className={cn('max-w-[70%] sm:max-w-[60%]', isOwn && 'items-end')}>
                        {showMeta && !isOwn && (
                          <p className="text-xs text-[var(--color-text-muted)] mb-1 ml-1">
                            {msg.sender.firstName} {msg.sender.lastName}
                          </p>
                        )}

                        <div className={cn(
                          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                          isOwn ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-surface-card border border-surface-border text-white rounded-bl-sm',
                          isOptimistic && 'opacity-70'
                        )}>
                          {msg.content}
                        </div>

                        <div className={cn('flex items-center gap-1 mt-0.5 px-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
                          <span className="text-[10px] text-[var(--color-text-muted)]">{formatMessageTime(msg.createdAt)}</span>
                          {isOwn && !isOptimistic && (
                            <CheckCheck size={12} className={msg.isRead ? 'text-brand-400' : 'text-[var(--color-text-muted)]'} />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 sm:px-6 py-4 border-t border-surface-border bg-surface-card shrink-0">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className={cn(
                'w-full px-4 py-3 rounded-2xl text-sm text-white resize-none',
                'bg-surface border border-surface-border',
                'placeholder:text-[var(--color-text-muted)]',
                'focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30',
                'transition-colors duration-200 max-h-32'
              )}
              style={{ minHeight: '48px' }}
              onInput={e => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = `${Math.min(el.scrollHeight, 128)}px`
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0',
              input.trim() ? 'bg-brand-500 hover:bg-brand-400 text-white' : 'bg-surface-card border border-surface-border text-[var(--color-text-muted)] cursor-not-allowed'
            )}
          >
            {isSending
              ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              : <Send size={18} />
            }
          </button>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] text-center mt-2">
          Messages are private between you and {counterpartName}.
        </p>
      </div>
    </div>
  )
}
