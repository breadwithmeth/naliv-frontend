import { useState, useEffect, useCallback } from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useAddress } from '../contexts/AddressContext'
import { useBusiness } from '../contexts/BusinessContext'
import { useNotifications } from '../contexts/NotificationContext'
import { Link, useNavigate } from 'react-router-dom'
import SmartAddressSelectionModal from '../components/SmartAddressSelectionModal'
import BusinessSelectionModal from '../components/BusinessSelectionModal'
import ActiveOrderCard from '../components/ActiveOrderCard'
import AddressDebugSimple from '../components/AddressDebugSimple'
import NotificationsPanel from '../components/NotificationsPanel'

import { createApiUrl, createApiUrlWithParams } from '../utils/api'

interface Item {
  item_id: number
  name: string
  price: number
  photo?: string
  description?: string
  category_id: number
}

interface ItemsApiResponse {
  success: boolean
  data: {
    items: Item[]
  }
}

interface ActiveOrder {
  order_id: number
  order_uuid: string
  user_id: number
  business_id: number
  delivery_type: 'DELIVERY' | 'PICKUP' | null
  current_status: {
    status: number
    name: string
    color: string
    icon: string
    time_ago: string
  } | null
  business: {
    business_id: number
    name: string
    address: string
    logo?: string
  } | null
  user: {
    user_id: number
    name: string
    login: string
  } | null
  cost: {
    total: number
    delivery: number
    service_fee: number
  } | null
  items_count: number
  time_since_created: string
}

interface ActiveOrdersResponse {
  success: boolean
  data: {
    orders: ActiveOrder[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      total_pages: number
      total_all_orders: number
    }
    filters: {
      business_id?: number
      only_user_orders?: boolean
    }
  }
  message: string
}

export default function Home() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('Популярные')
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false)
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] =
    useState(false)

  // Состояние для активных заказов
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  const { removeItem, getItemQuantity } = useCart()
  const { user } = useAuth()
  const { selectedAddress } = useAddress()
  const { selectedBusiness } = useBusiness()
  const { unreadCount, addNotification, registerToken } = useNotifications()

  const filters = ['Популярные', 'Новинки', 'Акции']

  // Функция для получения активных заказов
  const fetchActiveOrders = useCallback(async () => {
    if (!user) {
      setActiveOrders([])
      return
    }

    try {
      setLoadingOrders(true)
      setOrdersError(null)

      let url = createApiUrlWithParams('/api/orders/active', { limit: 5 })
      if (selectedBusiness) {
        url = createApiUrlWithParams('/api/orders/active', {
          limit: 5,
        })
      }

      console.log('Fetching active orders from:', url)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Orders response status:', response.status)

      if (response.ok) {
        const data: ActiveOrdersResponse = await response.json()
        console.log('Orders response data:', data)

        if (data.success && data.data && Array.isArray(data.data.orders)) {
          // Проверяем каждый заказ на корректность данных и фильтруем только активные
          const validOrders = data.data.orders.filter(order => {
            const isValid =
              order && order.order_id && order.current_status && order.business

            // Фильтруем только активные заказы (исключаем доставленные и отмененные)
            const isActive =
              order.current_status?.status !== 5 &&
              order.current_status?.status !== 99

            if (!isValid) {
              console.warn('Invalid order data:', order)
            }

            return isValid && isActive
          })

          setActiveOrders(validOrders)
          console.log('Valid active orders loaded:', validOrders.length)
        } else {
          console.warn('API response format error:', data)
          setOrdersError(data.message || 'Неправильный формат ответа сервера')
        }
      } else {
        const errorText = await response.text()
        console.error('Orders API error:', response.status, errorText)
        setOrdersError(
          `Ошибка ${response.status}: ${errorText || 'Не удалось загрузить заказы'}`
        )
      }
    } catch (error) {
      console.error('Error fetching active orders:', error)
      setOrdersError('Не удалось подключиться к серверу')
    } finally {
      setLoadingOrders(false)
    }
  }, [user, selectedBusiness])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Получаем товары с учетом выбранного магазина
        let itemsUrl = createApiUrl('/api/items')
        if (selectedBusiness) {
          itemsUrl = createApiUrlWithParams('/api/items', {
            business_id: selectedBusiness.id,
          })
        }

        const itemsResponse = await fetch(itemsUrl)
        const itemsData: ItemsApiResponse = await itemsResponse.json()

        if (itemsData.success) {
          setItems(itemsData.data.items.slice(0, 10))
        }
      } catch (err) {
        setError('Не удалось подключиться к серверу')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedBusiness]) // Добавляем selectedBusiness как зависимость

  // Загружаем активные заказы при изменении пользователя или магазина
  useEffect(() => {
    if (user) {
      fetchActiveOrders()
    }
  }, [user, selectedBusiness, fetchActiveOrders])

  // Автоматическая регистрация FCM токена при входе пользователя
  useEffect(() => {
    if (user) {
      registerToken().catch(error => {
        console.error('Failed to register FCM token:', error)
      })
    }
  }, [user, registerToken])

  // Периодическое обновление активных заказов каждые 30 секунд
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchActiveOrders()
    }, 30000) // 30 секунд

    return () => clearInterval(interval)
  }, [user, selectedBusiness, fetchActiveOrders])

  const handleRemoveFromCart = (itemId: number) => {
    removeItem(itemId)
  }

  const handleOrderClick = (orderId: number) => {
    // Переходим на страницу заказа вместо открытия модального окна
    navigate(`/orders/${orderId}`)
  }

  // Функция для тестирования уведомлений (временная)
  const testNotification = () => {
    const notifications = [
      {
        title: 'Заказ готов!',
        body: 'Ваш заказ #12345 готов к получению',
        type: 'order' as const,
      },
      {
        title: 'Скидка 20%!',
        body: 'Специальное предложение только сегодня',
        type: 'promotion' as const,
      },
      {
        title: 'Доставка в пути',
        body: 'Курьер уже направляется к вам',
        type: 'info' as const,
      },
    ]

    const randomNotification =
      notifications[Math.floor(Math.random() * notifications.length)]
    addNotification(randomNotification)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-40 safe-area-inset-top">
        <div className="px-4 pt-3 pb-4">
          {/* Верхняя строка */}
          <div className="flex items-center justify-between mb-4">
            {/* Логотип */}
            <Link to="/" className="flex items-center">
              <span className="text-lg font-bold text-black">
                Налив/Градусы24
              </span>
            </Link>

            {/* Бонусы, уведомления и аватар */}
            <div className="flex items-center space-x-3">
              {user && (
                <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1.5 rounded-full">
                  <span className="text-sm">🎁</span>
                  <span className="text-sm font-semibold text-black">120</span>
                </div>
              )}

              {/* Кнопка уведомлений */}
              {user && (
                <button
                  onClick={() => setIsNotificationsPanelOpen(true)}
                  className="relative w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}

              <Link
                to="/profile"
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
              >
                {user ? (
                  <span className="text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </Link>
            </div>
          </div>

          {/* Поиск */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск товаров..."
                className="w-full bg-gray-100 rounded-full px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Адрес и магазин */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Адрес доставки */}
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="flex items-start space-x-2 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-4 h-4 mt-0.5 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-black mb-0.5">
                  Адрес доставки
                </p>
                {selectedAddress ? (
                  <>
                    {selectedAddress.name &&
                      selectedAddress.name !== 'Новый адрес' && (
                        <p className="text-xs font-medium text-gray-800 leading-tight">
                          {selectedAddress.name}
                        </p>
                      )}
                    <p className="text-xs text-gray-600 leading-tight truncate">
                      {selectedAddress.address}
                    </p>
                    {selectedAddress.apartment && (
                      <p className="text-xs text-gray-500">
                        кв. {selectedAddress.apartment}
                      </p>
                    )}
                    {/* Показываем информацию о доставке если доступна */}
                    {selectedAddress.delivery && (
                      <div className="mt-1">
                        {selectedAddress.delivery.available ? (
                          <p className="text-xs text-green-600">
                            ✓ Доставка: {selectedAddress.delivery.price} ₸
                          </p>
                        ) : (
                          <p className="text-xs text-red-500">
                            ✗ Доставка недоступна
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-500">Выберите адрес</p>
                )}
              </div>
            </button>

            {/* Магазин */}
            <button
              onClick={() => setIsBusinessModalOpen(true)}
              className="flex items-start space-x-2 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-4 h-4 mt-0.5 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-black mb-0.5">Магазин</p>
                {selectedBusiness ? (
                  <>
                    <p className="text-xs text-gray-600 leading-tight truncate">
                      {selectedBusiness.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {selectedBusiness.address}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-500">Выберите магазин</p>
                )}
              </div>
            </button>
          </div>

          {/* Доставка */}
          {/* <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-black">Доставка</span>
              {isCalculatingDelivery ? (
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              ) : deliveryCost !== null ? (
                <span className="text-sm font-bold text-orange-600">
                  {deliveryCost} ₸
                </span>
              ) : (
                <span className="text-sm text-gray-500">—</span>
              )}
            </div>
          </div> */}
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-header pb-bottom-nav px-4">
        <div className="space-y-4">
          {/* Активные заказы */}
          {user && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Активные заказы
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={fetchActiveOrders}
                    disabled={loadingOrders}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    title="Обновить заказы"
                  >
                    <svg
                      className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                  {/* Кнопка тестирования уведомлений (временная) */}
                  <button
                    onClick={testNotification}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Тестовое уведомление"
                  >
                    🔔
                  </button>
                  {activeOrders.length > 0 && (
                    <Link
                      to="/orders"
                      className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Все заказы
                    </Link>
                  )}
                </div>
              </div>

              {loadingOrders ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  <span className="ml-2 text-sm text-gray-600">
                    Загрузка заказов...
                  </span>
                </div>
              ) : ordersError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 mb-2">{ordersError}</p>
                  <button
                    onClick={fetchActiveOrders}
                    className="text-sm text-red-700 hover:text-red-800 font-medium bg-red-100 px-3 py-1 rounded"
                  >
                    Повторить попытку
                  </button>

                  {/* Информация для отладки */}
                  <details className="mt-3">
                    <summary className="text-xs text-red-500 cursor-pointer">
                      Детали для разработчика
                    </summary>
                    <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                      <p>
                        URL:{' '}
                        {createApiUrlWithParams('/api/orders/active', {
                          limit: 5,
                          // ...(selectedBusiness
                          //   ? { business_id: selectedBusiness.id }
                          //   : {}),
                        })}
                      </p>
                      <p>
                        Пользователь: {user ? 'Авторизован' : 'Не авторизован'}
                      </p>
                      <p>
                        Токен:{' '}
                        {localStorage.getItem('token') ? 'Есть' : 'Отсутствует'}
                      </p>
                    </div>
                  </details>
                </div>
              ) : activeOrders.length > 0 ? (
                <div className="space-y-3">
                  {activeOrders.map(order => (
                    <ActiveOrderCard
                      key={order.order_id}
                      order={order}
                      onClick={handleOrderClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-8 h-8 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Нет активных заказов
                  </p>
                  <p className="text-xs text-gray-500">
                    Оформите первый заказ, чтобы увидеть его здесь
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Фильтры */}
          <div className="flex items-center space-x-3 px-1">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filter}
              </button>
            ))}
            <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
            </button>
          </div>

          {/* Товары */}
          <div className="grid grid-cols-2 gap-3">
            {loading
              ? Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 animate-pulse"
                    >
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))
              : items.map(item => {
                  const quantity = getItemQuantity(item.item_id)
                  return (
                    <div
                      key={item.item_id}
                      className="bg-white rounded-lg p-4 relative"
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>

                      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-orange-600 font-bold mb-3">
                        {item.price} ₸
                      </p>

                      <div className="absolute bottom-4 left-4 right-4">
                        {quantity > 0 ? (
                          <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                            <button
                              onClick={() => handleRemoveFromCart(item.item_id)}
                              className="w-6 h-6 flex items-center justify-center text-orange-600 hover:bg-orange-100 rounded"
                            >
                              <span className="text-lg leading-none">-</span>
                            </button>
                            <span className="font-medium text-orange-600">
                              {quantity}
                            </span>
                            <button
                              disabled
                              className="w-6 h-6 flex items-center justify-center text-orange-400 opacity-50"
                            >
                              <span className="text-lg leading-none">+</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-gray-100 rounded-lg py-2 text-sm font-medium text-gray-500"
                          >
                            В корзину
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
          </div>

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Быстрые ссылки */}
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 px-2">
              Быстрые действия
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/catalog"
                className="bg-white rounded-lg p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Каталог</p>
                  <p className="text-sm text-gray-500">Все товары</p>
                </div>
              </Link>

              <Link
                to="/stores"
                className="bg-white rounded-lg p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Магазины</p>
                  <p className="text-sm text-gray-500">Найти рядом</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Модальные окна */}
      <SmartAddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />

      <BusinessSelectionModal
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
      />

      {/* Панель уведомлений */}
      <NotificationsPanel
        isOpen={isNotificationsPanelOpen}
        onClose={() => setIsNotificationsPanelOpen(false)}
      />

      {/* Debug component */}
      <AddressDebugSimple />
    </div>
  )
}
