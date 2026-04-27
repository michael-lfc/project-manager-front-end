import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
}                           from 'react'
import api, {
  getErrorMessage,
}                           from '../services/api.ts'
import { useAuth }          from '../hooks/useAuth.ts'
import { useSocket }        from '../hooks/useSocket.ts'
import type {
  INotification,
  ApiResponse,
}                           from '../types/index.ts'

// ─── Context Shape ────────────────────────────────────
interface NotificationContextType {
  notifications:  INotification[]
  unreadCount:    number
  loading:        boolean
  error:          string | null
  fetchNotifications:       ()               => Promise<void>
  markAsRead:               (id: string)     => Promise<void>
  markAllAsRead:            ()               => Promise<void>
  deleteNotification:       (id: string)     => Promise<void>
}

// ─── Context ──────────────────────────────────────────
const NotificationContext = createContext<NotificationContextType | null>(null)

// ─── Provider ─────────────────────────────────────────
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuth }          = useAuth()
  const { socket }          = useSocket()
  const [notifications,
         setNotifications]  = useState<INotification[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // ─── Derived State ─────────────────────────────────
  const unreadCount = notifications.filter(n => !n.isRead).length

  // ─── Fetch Notifications ───────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!isAuth) return

    setLoading(true)
    setError(null)

    try {
      const response = await api.get<ApiResponse<{
        notifications: INotification[]
      }>>('/notifications')

      setNotifications(response.data.data?.notifications ?? [])

    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [isAuth])

  // ─── Mark Single as Read ───────────────────────────
  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`)

      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      )
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  // ─── Mark All as Read ──────────────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all')

      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      )
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  // ─── Delete Notification ───────────────────────────
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`)

      setNotifications(prev =>
        prev.filter(n => n._id !== id)
      )
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  // ─── Fetch on Auth ─────────────────────────────────
  useEffect(() => {
    if (isAuth) {
      fetchNotifications()
    } else {
      setNotifications([])
    }
  }, [isAuth, fetchNotifications])

  // ─── Listen to Socket Events ───────────────────────
  useEffect(() => {
    if (!socket) return

    // 🔥 New notification received — with deduplication
    const handleNewNotification = (notification: INotification) => {
      setNotifications(prev => {
        // Check if notification already exists (prevents duplicates)
        const exists = prev.some(n => n._id === notification._id)
        if (exists) {
          // Update the existing one instead of adding duplicate
          return prev.map(n => n._id === notification._id ? notification : n)
        }
        return [notification, ...prev]
      })
    }

    // Notification marked as read from another device
    const handleNotificationRead = (id: string) => {
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      )
    }

    socket.on('notification:new',  handleNewNotification)
    socket.on('notification:read', handleNotificationRead)

    return () => {
      socket.off('notification:new',  handleNewNotification)
      socket.off('notification:read', handleNotificationRead)
    }
  }, [socket])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}