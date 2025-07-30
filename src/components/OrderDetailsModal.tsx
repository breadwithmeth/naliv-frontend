import { useState, useEffect, useCallback } from 'react'
import { createApiUrl } from '../utils/api'

interface OrderItem {
  relation_id: number
  item_id: number
  amount: number
  price: number
  item_name: string
  item_code: string
  item_img: string
}

interface OrderBusiness {
  id: number
  name: string
  address: string
}

interface OrderUser {
  id: number
  name: string
  phone: string
}

interface OrderStatus {
  status: number
  isCanceled: number
  log_timestamp: string
}

interface OrderCost {
  cost: number
  service_fee: number
  delivery: number
}

interface OrderDetails {
  order_id: number
  order_uuid: string
  user_id: number
  business_id: number
  address_id: number
  delivery_price: number
  bonus: number
  extra?: string
  payment_id?: string
  log_timestamp: string
  items: OrderItem[]
  business: OrderBusiness
  user: OrderUser
  status: OrderStatus
  cost: OrderCost | null
}

interface OrderDetailsResponse {
  success: boolean
  data: {
    order: OrderDetails
  }
  message: string
}

interface OrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: number | null
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  orderId,
}: OrderDetailsModalProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return

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
          setOrderDetails(data.data.order)
        } else {
          setError(data.message || 'Не удалось загрузить детали заказа')
        }
      } else {
        const errorText = await response.text()
        setError(
          `Ошибка ${response.status}: ${errorText || 'Не удалось загрузить заказ'}`
        )
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      setError('Не удалось подключиться к серверу')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails()
    }
  }, [isOpen, orderId, fetchOrderDetails])

  const getStatusInfo = (status: number, isCanceled: number) => {
    if (isCanceled === 1) {
      return {
        name: 'Отменен',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      }
    }

    switch (status) {
      case 0:
        return {
          name: 'Новый заказ',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        }
      case 1:
        return {
          name: 'Подтвержден',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
        }
      case 2:
        return {
          name: 'Готовится',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        }
      case 3:
        return {
          name: 'В пути',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
        }
      case 4:
        return {
          name: 'Прибыл',
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
        }
      case 5:
        return {
          name: 'Доставлен',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        }
      default:
        return {
          name: 'Неизвестный статус',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Детали заказа</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              <span className="ml-2 text-sm text-gray-600">Загрузка...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchOrderDetails}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Повторить попытку
              </button>
            </div>
          ) : orderDetails ? (
            <div className="space-y-4">
              {/* Order Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Информация о заказе
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Номер заказа:</span>
                    <span className="text-sm font-medium">
                      #{orderDetails.order_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">UUID:</span>
                    <span className="text-sm font-mono">
                      {orderDetails.order_uuid}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Дата создания:
                    </span>
                    <span className="text-sm">
                      {new Date(orderDetails.log_timestamp).toLocaleString(
                        'ru-RU'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Статус</h3>
                {(() => {
                  const statusInfo = getStatusInfo(
                    orderDetails.status.status,
                    orderDetails.status.isCanceled
                  )
                  return (
                    <div
                      className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-3`}
                    >
                      <span className={`${statusInfo.color} font-medium`}>
                        {statusInfo.name}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Обновлено:{' '}
                        {new Date(
                          orderDetails.status.log_timestamp
                        ).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Business */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Магазин</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900">
                    {orderDetails.business.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {orderDetails.business.address}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Товары</h3>
                <div className="space-y-2">
                  {orderDetails.items.map(item => (
                    <div
                      key={item.relation_id}
                      className="bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {item.item_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Код: {item.item_code}
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <div className="text-sm font-medium">
                            {item.amount} шт.
                          </div>
                          <div className="text-sm text-orange-600 font-bold">
                            {item.price} ₸
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Стоимость</h3>
                {orderDetails.cost ? (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Товары:</span>
                      <span className="text-sm">
                        {orderDetails.cost.cost -
                          orderDetails.cost.delivery -
                          orderDetails.cost.service_fee}{' '}
                        ₸
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Доставка:</span>
                      <span className="text-sm">
                        {orderDetails.cost.delivery} ₸
                      </span>
                    </div>
                    {orderDetails.cost.service_fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Сервисный сбор:
                        </span>
                        <span className="text-sm">
                          {orderDetails.cost.service_fee} ₸
                        </span>
                      </div>
                    )}
                    {orderDetails.bonus > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Бонусы:</span>
                        <span className="text-sm text-green-600">
                          -{orderDetails.bonus} ₸
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">
                          Итого:
                        </span>
                        <span className="font-bold text-orange-600">
                          {orderDetails.cost.cost} ₸
                        </span>
                      </div>
                    </div>
                  </div>
                ) : orderDetails.items.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Стоимость товаров:
                      </span>
                      <span className="text-sm">
                        {orderDetails.items.reduce(
                          (total, item) => total + item.price,
                          0
                        )}{' '}
                        ₸
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Доставка:</span>
                      <span className="text-sm">
                        {orderDetails.delivery_price || 0} ₸
                      </span>
                    </div>
                    {orderDetails.bonus > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Бонусы:</span>
                        <span className="text-sm text-green-600">
                          -{orderDetails.bonus} ₸
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">
                          Примерная стоимость:
                        </span>
                        <span className="font-bold text-orange-600">
                          {orderDetails.items.reduce(
                            (total, item) => total + item.price,
                            0
                          ) +
                            orderDetails.delivery_price -
                            orderDetails.bonus}{' '}
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

              {/* Comment */}
              {orderDetails.extra && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Комментарий
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      {orderDetails.extra}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment ID */}
              {orderDetails.payment_id && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Платеж</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-sm font-mono text-gray-700">
                      {orderDetails.payment_id}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
