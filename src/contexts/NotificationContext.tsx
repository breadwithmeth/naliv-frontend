import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import {
  requestNotificationPermission,
  onMessageListener,
} from '../utils/firebase'

interface Notification {
  id: string
  title: string
  body: string
  timestamp: number
  read: boolean
  data?: Record<string, unknown>
  type?: 'info' | 'success' | 'warning' | 'error' | 'order' | 'promotion'
}

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
  requestPermission: () => Promise<string | null>
  registerToken: () => Promise<string | null>
  isSupported: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator)

    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (error) {
        console.error('Error parsing saved notifications:', error)
      }
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration)
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  useEffect(() => {
    // Listen for foreground messages
    if (isSupported) {
      onMessageListener()
        .then((payload: unknown) => {
          console.log('Foreground message received:', payload)

          const firebasePayload = payload as {
            notification?: { title?: string; body?: string }
            data?: Record<string, unknown>
          }

          const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> =
            {
              title: firebasePayload.notification?.title || 'Новое уведомление',
              body:
                firebasePayload.notification?.body ||
                'У вас есть новое уведомление',
              data: firebasePayload.data,
              type:
                (firebasePayload.data?.type as Notification['type']) || 'info',
            }

          addNotification(notification)

          // Show browser notification if permission is granted
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.body,
              icon: '/favicon.ico',
              tag: (firebasePayload.data?.tag as string) || 'default',
            })
          }
        })
        .catch(error => {
          console.error('Error listening for messages:', error)
        })
    }
  }, [isSupported])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false,
    }

    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const requestPermission = async () => {
    if (!isSupported) {
      console.warn('Notifications are not supported in this browser')
      return null
    }

    return await requestNotificationPermission()
  }

  const registerToken = async () => {
    if (!isSupported) {
      console.warn('Notifications are not supported in this browser')
      return null
    }

    // Only register token if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('User not authenticated, skipping FCM token registration')
      return null
    }

    return await requestNotificationPermission()
  }

  const unreadCount = notifications.filter(notif => !notif.read).length

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    requestPermission,
    registerToken,
    isSupported,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    )
  }
  return context
}
