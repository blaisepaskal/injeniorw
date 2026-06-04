import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/auth.store'

interface Message {
  id: string
  contractId: string
  senderId: string
  content: string
  type: string
  attachmentUrls: string[]
  isRead: boolean
  readAt?: string
  createdAt: string
  sender: {
    id: string
    firstName: string
    lastName: string
    avatarUrl?: string
  }
}

interface UseMessagingOptions {
  contractId: string
  onNewMessage?: (message: Message) => void
}

export function useMessaging({ contractId, onNewMessage }: UseMessagingOptions) {
  const { accessToken } = useAuthStore()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    if (!accessToken || !contractId) return

    setIsConnecting(true)

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

    const socket = io(`${WS_URL}/messages`, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      setIsConnected(true)
      setIsConnecting(false)
      socket.emit('join_contract', { contractId })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('connect_error', () => {
      setIsConnecting(false)
      setIsConnected(false)
    })

    socket.on('new_message', (message: Message) => {
      onNewMessage?.(message)
    })

    socket.on('messages_read', ({ userId }: { userId: string }) => {
      // Handle read receipts if needed
    })

    socketRef.current = socket

    return () => {
      socket.emit('leave_contract', { contractId })
      socket.disconnect()
      socketRef.current = null
    }
  }, [accessToken, contractId])

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !isConnected) return false
    socketRef.current.emit('send_message', { contractId, content })
    return true
  }, [contractId, isConnected])

  const markRead = useCallback(() => {
    if (!socketRef.current || !isConnected) return
    socketRef.current.emit('mark_read', { contractId })
  }, [contractId, isConnected])

  return { isConnected, isConnecting, sendMessage, markRead }
}

// ── Notification socket hook ──────────────────────────────────

export function useNotificationSocket(onNotification?: (n: any) => void) {
  const { accessToken } = useAuthStore()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!accessToken) return

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

    const socket = io(`${WS_URL}/messages`, {
      auth: { token: accessToken },
      transports: ['websocket'],
    })

    socket.on('notification', (notification: any) => {
      onNotification?.(notification)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [accessToken])
}
