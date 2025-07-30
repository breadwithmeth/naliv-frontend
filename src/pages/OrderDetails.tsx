import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createApiUrl } from '../utils/api'

// Функция для получения информации о статусе
const getStatusInfo = (status: number, isCanceled: number) => {
  console.log(
    'getStatusInfo called with status:',
    status,
    'type:',
    typeof status,
    'isCanceled:',
    isCanceled,
    'type:',
    typeof isCanceled
  )
  console.log('Checking status === 66:', status === 66)
  console.log('Checking status == 66:', status == 66)

  if (isCanceled === 1) {
    console.log('Order is canceled')
    return {
      name: 'Отменен',
      color: '#dc2626',
      description: 'Заказ был отменен',
    }
  }

  switch (status) {
    case 0:
      return {
        name: 'Новый заказ',
        color: '#2563eb',
        description: 'Заказ создан и ожидает подтверждения',
      }
    case 1:
      return {
        name: 'Подтвержден',
        color: '#ea580c',
        description: 'Заказ подтвержден магазином',
      }
    case 2:
      return {
        name: 'Готовится',
        color: '#ca8a04',
        description: 'Заказ собирается',
      }
    case 3:
      return {
        name: 'В пути',
        color: '#7c3aed',
        description: 'Курьер направляется к вам',
      }
    case 4:
      return {
        name: 'Прибыл',
        color: '#4f46e5',
        description: 'Курьер прибыл по адресу',
      }
    case 5:
      return {
        name: 'Доставлен',
        color: '#16a34a',
        description: 'Заказ успешно доставлен',
      }
    case 66:
      console.log('Status 66 matched - returning Ожидает оплаты')
      return {
        name: 'Ожидает оплаты',
        color: '#dc2626',
        description: 'Заказ ожидает оплаты',
      }
    default:
      console.log('Unknown status:', status, 'type:', typeof status)
      return {
        name: `Неизвестный статус (${status})`,
        color: '#6b7280',
        description: 'Статус заказа неизвестен',
      }
  }
}

interface OrderDetails {
  order_id: number
  order_uuid: string
  user_id: number
  business_id: number
  address_id: number | null
  delivery_price: number
  bonus: number
  extra?: string
  payment_id?: string | null
  log_timestamp: string
  is_canceled: number
  items: Array<{
    relation_id: number
    item_id: number
    amount: string // API возвращает строку
    price: string // API возвращает строку
    item_name: string
    item_code: string
    item_img?: string
  }>
  business: {
    id: number
    name: string
    address: string
  }
  user: {
    id: number
    name: string
    phone: string
  }
  status: {
    status: number
    isCanceled: number
    log_timestamp: string
  } | null
  cost: {
    cost: number
    service_fee: number
    delivery: number
  } | null
}

interface OrderDetailsResponse {
  success: boolean
  data: {
    order: OrderDetails
  }
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

        const response = await fetch(createApiUrl(`/api/orders/${orderId}`), {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data: OrderDetailsResponse = await response.json()
          if (data.success) {
            console.log('Order received:', data.data.order)
            console.log('Order status object:', data.data.order.status)
            console.log('Order is_canceled:', data.data.order.is_canceled)
            setOrder(data.data.order)
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
          <button onClick={() => navigate(-1)} className="mr-3">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
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
          <button onClick={() => navigate(-1)} className="mr-3">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-medium flex-1">Заказ не найден</h1>
        </div>

        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              Заказ не найден
            </h2>
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
        <button onClick={() => navigate(-1)} className="mr-3">
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-lg font-medium flex-1">Заказ #{order.order_id}</h1>
      </div>

      {/* Content */}
      <div className="px-4 space-y-4">
        {/* Статус заказа */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Статус заказа
            </h2>
            <span
              className="px-3 py-1 text-sm font-medium rounded-full"
              style={{
                backgroundColor:
                  getStatusInfo(
                    Number(order.status?.status) || 0,
                    Number(order.status?.isCanceled) ||
                      Number(order.is_canceled) ||
                      0
                  ).color + '20',
                color: getStatusInfo(
                  Number(order.status?.status) || 0,
                  Number(order.status?.isCanceled) ||
                    Number(order.is_canceled) ||
                    0
                ).color,
              }}
            >
              {
                getStatusInfo(
                  Number(order.status?.status) || 0,
                  Number(order.status?.isCanceled) ||
                    Number(order.is_canceled) ||
                    0
                ).name
              }
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {
              getStatusInfo(
                Number(order.status?.status) || 0,
                Number(order.status?.isCanceled) ||
                  Number(order.is_canceled) ||
                  0
              ).description
            }
          </p>
          {order.status?.log_timestamp && (
            <p className="text-xs text-gray-500 mt-2">
              Обновлено:{' '}
              {new Date(order.status.log_timestamp).toLocaleString('ru-RU')}
            </p>
          )}
        </div>

        {/* Информация о магазине */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Магазин</h2>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-orange-500"
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
              <h3 className="font-medium text-gray-900">
                {order.business.name}
              </h3>
              <p className="text-sm text-gray-600">{order.business.address}</p>
            </div>
          </div>
        </div>

        {/* Детали заказа */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Детали заказа
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Тип получения:</span>
              <span className="font-medium">
                {order.delivery_price > 0 ? 'Доставка' : 'Самовывоз'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Количество товаров:</span>
              <span className="font-medium">{order.items?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Создан:</span>
              <span className="font-medium">
                {new Date(order.log_timestamp).toLocaleString('ru-RU')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">UUID:</span>
              <span className="font-medium text-xs">{order.order_uuid}</span>
            </div>
            {order.bonus > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Бонусы:</span>
                <span className="font-medium text-green-600">
                  -{order.bonus} ₸
                </span>
              </div>
            )}
            {/* Временная отладочная информация */}
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
              <div>Статус объект: {order.status ? 'Есть' : 'Отсутствует'}</div>
              <div>
                Статус код: {order.status?.status} (тип:{' '}
                {typeof order.status?.status})
              </div>
              <div>
                isCanceled (статус): {order.status?.isCanceled} (тип:{' '}
                {typeof order.status?.isCanceled})
              </div>
              <div>
                is_canceled (заказ): {order.is_canceled} (тип:{' '}
                {typeof order.is_canceled})
              </div>
              <div>Number(статус): {Number(order.status?.status)}</div>
              <div>
                Результат getStatusInfo:{' '}
                {
                  getStatusInfo(
                    Number(order.status?.status) || 0,
                    Number(order.status?.isCanceled) ||
                      Number(order.is_canceled) ||
                      0
                  ).name
                }
              </div>
            </div>
          </div>
        </div>

        {/* Стоимость */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Стоимость
          </h2>
          {order.cost ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Товары:</span>
                <span className="font-medium">
                  {(
                    order.cost.cost -
                    order.cost.delivery -
                    order.cost.service_fee
                  ).toFixed(2)}{' '}
                  ₸
                </span>
              </div>
              {order.cost.delivery > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Доставка:</span>
                  <span className="font-medium">
                    {order.cost.delivery.toFixed(2)} ₸
                  </span>
                </div>
              )}
              {order.cost.service_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Сервисный сбор:</span>
                  <span className="font-medium">
                    {order.cost.service_fee.toFixed(2)} ₸
                  </span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Итого:</span>
                  <span className="text-orange-500">
                    {order.cost.cost.toFixed(2)} ₸
                  </span>
                </div>
              </div>
            </div>
          ) : order.items.length > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Стоимость товаров:</span>
                <span className="font-medium">
                  {order.items
                    .reduce(
                      (total, item) =>
                        total + parseFloat(item.price) * parseInt(item.amount),
                      0
                    )
                    .toFixed(2)}{' '}
                  ₸
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Доставка:</span>
                <span className="font-medium">
                  {order.delivery_price.toFixed(2)} ₸
                </span>
              </div>
              {order.bonus > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Бонусы:</span>
                  <span className="font-medium text-green-600">
                    -{order.bonus.toFixed(2)} ₸
                  </span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Примерная стоимость:</span>
                  <span className="text-orange-500">
                    {(
                      order.items.reduce(
                        (total, item) =>
                          total +
                          parseFloat(item.price) * parseInt(item.amount),
                        0
                      ) +
                      order.delivery_price -
                      order.bonus
                    ).toFixed(2)}{' '}
                    ₸
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                * Точная стоимость может отличаться
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500">
                Информация о стоимости недоступна
              </p>
            </div>
          )}
        </div>

        {/* Товары в заказе */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Товары</h2>
            <div className="space-y-3">
              {order.items.map(item => (
                <div
                  key={item.relation_id}
                  className="flex justify-between items-start"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.item_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Код: {item.item_code}
                    </p>
                    <p className="text-sm text-gray-600">
                      Количество: {item.amount} шт.
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-semibold text-orange-500">
                      {(parseFloat(item.price) * parseInt(item.amount)).toFixed(
                        2
                      )}{' '}
                      ₸
                    </p>
                    <p className="text-xs text-gray-500">
                      {parseFloat(item.price).toFixed(2)} ₸ × {item.amount} шт.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Комментарий */}
        {order.extra && (
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Комментарий
            </h2>
            <p className="text-gray-700">{order.extra}</p>
          </div>
        )}

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
