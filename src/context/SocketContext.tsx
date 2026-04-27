import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { io, Socket } from 'socket.io-client'
import { config } from '../config/env.ts'
import { useAuth } from '../hooks/useAuth.ts'

// ─── Context ──────────────────────────────────────────
interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinProject: (projectId: string) => void
  leaveProject: (projectId: string) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

// ─── Provider ─────────────────────────────────────────
export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuth, user } = useAuth()

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // ✅ Strong guard (prevents undefined userId issues)
    if (!isAuth || !token || !user?._id) return

    const userId = user._id

    console.log('🆔 Socket userId:', userId)

    const newSocket = io(config.socketUrl, {
      auth: { token, userId },
      transports: ['websocket'],
      reconnection: true,
    })

    // ── CONNECT ─────────────────────────────────────
    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('✅ Socket connected:', newSocket.id)
    })

    // ── DISCONNECT ──────────────────────────────────
    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('❌ Socket disconnected')
    })

    // 🔔 ── NOTIFICATION LISTENER ────────────────────
    const handleNotification = (data: any) => {
      console.log('🔔 NOTIFICATION RECEIVED:', data)

      // 👉 later: update state / toast / UI
    }

    newSocket.on('notification', handleNotification)

    // ── ERROR ──────────────────────────────────────
    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket error:', err.message)
    })

    setSocket(newSocket)

    // 🧹 CLEANUP (VERY IMPORTANT)
    return () => {
      newSocket.off('notification', handleNotification)
      newSocket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [isAuth, token, user])

  // ── Join project ──────────────────────────────────
  const joinProject = useCallback(
    (projectId: string) => {
      socket?.emit('join:project', { projectId })
    },
    [socket]
  )

  // ── Leave project ─────────────────────────────────
  const leaveProject = useCallback(
    (projectId: string) => {
      socket?.emit('leave:project', { projectId })
    },
    [socket]
  )

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, joinProject, leaveProject }}
    >
      {children}
    </SocketContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────
export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}