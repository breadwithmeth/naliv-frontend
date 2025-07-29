import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface OrderDetails {
  order_id: number
  order_uuid: string
  user_id: number
  business_id: number
  delivery_type: 'DELIVERY' | 'PICKUP'
  current_status: {
    status: number
    name: string
    color: string
    icon: string
    time_ago: string
  }
  business: {
    business_id: number
    name: string
    address: string
    logo?: string
  }
  user: {
    user_id: number
    name: string
    login: string
  }
  cost: {
    total: number
    delivery: number
    service_fee: number
  }
  items_count: number
  time_since_created: string
  items?: Array<{
    item_id: number
    name: string
    price: number
    quantity: number
    photo?: string
  }>
}

interface OrderDetailsResponse {
  success: boolean
  data: OrderDetails
  message: string
}

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data: OrderDetailsResponse = await response.json()
          if (data.success) {
            setOrder(data.data)
          } else {
            setError(data.message || 'Не удалось загрузить заказ')
          }
        } else {
          setError(`Ошибка ${response.status}: Заказ не найден`)
        }
      } catch (err) {
        console.error('Error fetching order details:', err)
        setError('Не удалось подключиться к серверу')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId, user, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-medium flex-1">Заказ #{orderId}</h1>
        </div>
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка заказа...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-medium flex-1">Заказ не найден</h1>
        </div>
        
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Заказ не найден</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              to="/"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium inline-block"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="mr-3"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-medium flex-1">Заказ #{order.order_id}</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Статус заказа */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Статус заказа</h2>
            <span
              className="px-3 py-1 text-sm font-medium rounded-full"
              style={{ 
                backgroundColor: order.current_status.color + '20',
                color: order.current_status.color 
              }}
            >
              {order.current_status.name}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Обновлено {order.current_status.time_ago}
          </p>
        </div>

        {/* Информация о магазине */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Магазин</h2>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{order.business.name}</h3>
              <p className="text-sm text-gray-600">{order.business.address}</p>
            </div>
          </div>
        </div>

        {/* Детали заказа */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Детали заказа</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Тип получения:</span>
              <span className="font-medium">
                {order.delivery_type === 'DELIVERY' ? 'Доставка' : 'Самовывоз'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Количество товаров:</span>
              <span className="font-medium">{order.items_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Создан:</span>
              <span className="font-medium">{order.time_since_created}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">UUID:</span>
              <span className="font-medium text-xs">{order.order_uuid}</span>
            </div>
          </div>
        </div>

        {/* Стоимость */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Стоимость</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Товары:</span>
              <span className="font-medium">{(order.cost.total - order.cost.delivery - order.cost.service_fee).toFixed(2)} ₸</span>
            </div>
            {order.cost.delivery > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Доставка:</span>
                <span className="font-medium">{order.cost.delivery.toFixed(2)} ₸</span>
              </div>
            )}
            {order.cost.service_fee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Сервисный сбор:</span>
                <span className="font-medium">{order.cost.service_fee.toFixed(2)} ₸</span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Итого:</span>
                <span className="text-orange-500">{order.cost.total.toFixed(2)} ₸</span>
              </div>
            </div>
          </div>
        </div>

        {/* Дополнительные действия */}
        <div className="space-y-3">
          <Link
            to="/"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium text-center block"
          >
            На главную
          </Link>
          
          <Link
            to="/unpaid-orders"
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium text-center block hover:bg-gray-50"
          >
            Все заказы
          </Link>
        </div>
      </div>

      {/* Bottom Padding */}
      <div className="h-20"></div>
    </div>
  )
}
