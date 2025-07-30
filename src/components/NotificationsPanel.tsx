import { useState } from 'react'
import { useNotifications } from '../contexts/NotificationContext'

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsPanel({
  isOpen,
  onClose,
}: NotificationsPanelProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    requestPermission,
    isSupported,
  } = useNotifications()

  const [showPermissionRequest, setShowPermissionRequest] = useState(
    isSupported && Notification.permission === 'default'
  )

  const handleRequestPermission = async () => {
    const token = await requestPermission()
    if (token) {
      setShowPermissionRequest(false)
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'только что'
    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    return `${days} дн назад`
  }

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'order':
        return '📦'
      case 'promotion':
        return '🎉'
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '🔔'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Уведомления
              </h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Permission Request */}
          {showPermissionRequest && (
            <div className="p-4 bg-orange-50 border-b border-orange-200">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🔔</div>
                <div className="flex-1">
                  <h3 className="font-medium text-orange-900">
                    Разрешить уведомления?
                  </h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Получайте уведомления о статусе заказов и специальных
                    предложениях
                  </p>
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={handleRequestPermission}
                      className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                    >
                      Разрешить
                    </button>
                    <button
                      onClick={() => setShowPermissionRequest(false)}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                    >
                      Не сейчас
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Отметить все как прочитанные
                  </button>
                )}
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-gray-500 hover:text-gray-600 font-medium"
                >
                  Очистить все
                </button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="font-medium text-lg mb-2">Нет уведомлений</h3>
                <p className="text-sm text-center px-8">
                  Здесь будут отображаться уведомления о заказах и специальных
                  предложениях
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 ${
                      !notification.read ? 'bg-blue-50' : 'bg-white'
                    } hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.body}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Отметить как прочитанное"
                          >
                            <svg
                              className="w-4 h-4 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => clearNotification(notification.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Удалить уведомление"
                        >
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
