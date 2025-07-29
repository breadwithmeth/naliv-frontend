import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import PaymentModal from '../components/PaymentModal'

interface Order {
  order_id: number
  order_uuid: string
  total_cost: number
  delivery_price: number
  status: {
    status: number // 66 = UNPAID, 0 = NEW
    isCanceled: number
  }
  business: {
    name: string
    address: string
    city_name?: string
  }
  items_count: number
  log_timestamp: string
  comment?: string
}

interface OrdersResponse {
  success: boolean
  data: {
    orders: Order[]
    total: number
  }
  message: string
}

export default function UnpaidOrders() {
  const { user, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Загрузка неоплаченных заказов
  const loadUnpaidOrders = async () => {
    if (!user || !isAuthenticated) {
      setOrders([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:3000/api/orders/user/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: OrdersResponse = await response.json()

      if (data.success) {
        // Фильтруем только неоплаченные заказы
        const unpaidOrders = data.data.orders.filter(order => 
          order.status?.status === 66 || // UNPAID
          order.status?.status === 0     // NEW
        )
        setOrders(unpaidOrders)
      } else {
        throw new Error(data.message || 'Не удалось загрузить заказы')
      }
    } catch (error) {
      console.error('Error loading unpaid orders:', error)
      setError(error instanceof Error ? error.message : 'Произошла ошибка при загрузке заказов')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Открыть модалку оплаты
  const handlePayOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowPaymentModal(true)
  }

  // Закрыть модалку и обновить список
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedOrder(null)
    // Обновляем список заказов
    loadUnpaidOrders()
  }

  // Загружаем заказы при монтировании
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUnpaidOrders()
    }
  }, [isAuthenticated, user])

  // Проверка авторизации
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Необходима авторизация
          </h2>
          <p className="text-gray-600 mb-8">
            Войдите в аккаунт для просмотра неоплаченных заказов
          </p>
          <Link 
            to="/auth" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Войти в аккаунт
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Хлебные крошки */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li><Link to="/" className="hover:text-blue-600 transition-colors">Главная</Link></li>
          <li className="text-gray-300">/</li>
          <li><Link to="/profile" className="hover:text-blue-600 transition-colors">Профиль</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-gray-900 font-medium">Неоплаченные заказы</li>
        </ol>
      </nav>

      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Неоплаченные заказы
        </h1>
        <p className="text-gray-600">
          Завершите оплату ваших заказов с помощью сохраненных карт
        </p>
      </div>

      {/* Состояние загрузки */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Загружаем заказы...</p>
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-red-500 text-lg">⚠️</span>
            <div>
              <h3 className="font-medium text-red-800 mb-1">Ошибка загрузки</h3>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <button
                onClick={loadUnpaidOrders}
                className="text-sm text-red-600 underline hover:text-red-700 transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список заказов */}
      {!loading && !error && (
        <>
          {orders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  {/* Статус заказа */}
                  <div className="bg-red-50 border-b border-red-200 px-6 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-red-700 text-sm font-medium">
                        {order.status?.status === 66 ? 'Ожидает оплаты' : 'Новый заказ'}
                      </span>
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                        Не оплачен
                      </span>
                    </div>
                  </div>

                  {/* Информация о заказе */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Заказ #{order.order_id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.log_timestamp).toLocaleString('ru-RU')}
                      </p>
                    </div>

                    {/* Информация о магазине */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {order.business.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {order.business.city_name && `${order.business.city_name}, `}
                        {order.business.address}
                      </p>
                    </div>

                    {/* Детали заказа */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Товаров:</span>
                        <span className="font-medium">{order.items_count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Доставка:</span>
                        <span className="font-medium">
                          {order.delivery_price === 0 ? 'Бесплатно' : `${order.delivery_price} ₸`}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900">Итого:</span>
                          <span className="font-bold text-blue-600 text-lg">
                            {order.total_cost} ₸
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Комментарий */}
                    {order.comment && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Комментарий:</span> {order.comment}
                        </p>
                      </div>
                    )}

                    {/* Кнопка оплаты */}
                    <button
                      onClick={() => handlePayOrder(order)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Оплатить заказ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Пустое состояние */
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Нет неоплаченных заказов
              </h2>
              <p className="text-gray-600 mb-8">
                Все ваши заказы оплачены или у вас пока нет заказов
              </p>
              <div className="space-x-4">
                <Link 
                  to="/" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Перейти к покупкам
                </Link>
                <Link 
                  to="/orders" 
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Все заказы
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {/* Модальное окно оплаты */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        order={selectedOrder}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
