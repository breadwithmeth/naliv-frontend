import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { createApiUrl } from '../utils/api'

interface SavedCard {
  card_id: number
  mask: string
  halyk_card_id?: string
}

interface CardsResponse {
  success: boolean
  data: {
    cards: SavedCard[]
    total: number
  }
  message: string
}

interface Order {
  order_id: number
  order_uuid: string
  total_cost: number
  delivery_price: number
  status: {
    status: number
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

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  onPaymentSuccess: () => void
}

export default function PaymentModal({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
}: PaymentModalProps) {
  const { user } = useAuth()
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [selectedCard, setSelectedCard] = useState<SavedCard | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null)

  // Загрузка сохраненных карт
  const loadSavedCards = useCallback(async () => {
    if (!user) {
      setSavedCards([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(createApiUrl('/api/user/cards'), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CardsResponse = await response.json()

      if (data.success) {
        setSavedCards(data.data.cards)
        // Автоматически выбираем первую карту
        if (data.data.cards.length > 0) {
          setSelectedCard(data.data.cards[0])
        }
      } else {
        throw new Error(data.message || 'Не удалось загрузить карты')
      }
    } catch (error) {
      console.error('Error loading saved cards:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Произошла ошибка при загрузке карт'
      )
      setSavedCards([])
    } finally {
      setLoading(false)
    }
  }, [user])

  // Процесс оплаты
  const processPayment = async () => {
    if (!order || !selectedCard) {
      setError('Выберите карту для оплаты')
      return
    }

    try {
      setPaymentLoading(true)
      setError(null)

      // Отправляем запрос на создание платежа
      const response = await fetch(
        createApiUrl('/api/payments/pay-with-saved-card'),
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: order.order_id,
            saved_card_id: selectedCard.card_id,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Получаем HTML форму от сервера
      const htmlForm = await response.text()

      // Открываем форму Halyk Bank в новом окне
      const newPaymentWindow = window.open(
        '',
        'halyk_payment',
        'width=600,height=700,scrollbars=yes,resizable=yes,menubar=no,toolbar=no'
      )

      if (!newPaymentWindow) {
        throw new Error(
          'Не удалось открыть окно оплаты. Проверьте настройки блокировщика всплывающих окон.'
        )
      }

      // Записываем HTML в окно
      newPaymentWindow.document.write(htmlForm)
      newPaymentWindow.document.close()

      setPaymentWindow(newPaymentWindow)

      // Слушаем закрытие окна
      const checkClosed = setInterval(() => {
        if (newPaymentWindow.closed) {
          clearInterval(checkClosed)
          setPaymentWindow(null)

          // Проверяем результат оплаты
          checkPaymentStatus()
        }
      }, 1000)

      // Слушаем сообщения от окна оплаты
      const handleMessage = (event: MessageEvent) => {
        if (event.source === newPaymentWindow) {
          clearInterval(checkClosed)

          if (event.data.type === 'payment_success') {
            handlePaymentSuccess()
          } else if (event.data.type === 'payment_failure') {
            setError(
              `Ошибка оплаты: ${event.data.error || 'Неизвестная ошибка'}`
            )
          }

          newPaymentWindow.close()
          setPaymentWindow(null)
          window.removeEventListener('message', handleMessage)
        }
      }

      window.addEventListener('message', handleMessage)
    } catch (error) {
      console.error('Payment error:', error)
      setError(
        error instanceof Error ? error.message : 'Произошла ошибка при оплате'
      )
    } finally {
      setPaymentLoading(false)
    }
  }

  // Проверка статуса оплаты
  const checkPaymentStatus = async () => {
    if (!order) return

    try {
      const response = await fetch(
        createApiUrl(`/api/payments/order-payment-status/${order.order_id}`),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.paid) {
          handlePaymentSuccess()
        } else {
          setError('Оплата не завершена или была отменена')
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      setError('Не удалось проверить статус оплаты')
    }
  }

  // Обработка успешной оплаты
  const handlePaymentSuccess = () => {
    setPaymentLoading(false)
    setError(null)

    // Показываем уведомление об успехе
    alert('Заказ успешно оплачен!')

    // Закрываем модалку и обновляем список
    onPaymentSuccess()
  }

  // Сброс состояния при открытии модалки
  useEffect(() => {
    if (isOpen && order) {
      setSelectedCard(null)
      setError(null)
      setPaymentLoading(false)
      loadSavedCards()
    }
  }, [isOpen, order, loadSavedCards])

  // Закрытие окна оплаты при закрытии модалки
  useEffect(() => {
    return () => {
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close()
      }
    }
  }, [paymentWindow])

  if (!isOpen || !order) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Оплата заказа #{order.order_id}
          </h2>
          <button
            onClick={onClose}
            disabled={paymentLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
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

        <div className="p-6">
          {/* Информация о заказе */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Детали заказа</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Товаров:</span>
                <span>{order.items_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Доставка:</span>
                <span>
                  {order.delivery_price === 0
                    ? 'Бесплатно'
                    : `${order.delivery_price} ₸`}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-1 mt-2">
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>К оплате:</span>
                  <span className="text-blue-600">{order.total_cost} ₸</span>
                </div>
              </div>
            </div>
          </div>

          {/* Выбор карты */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4">
              Выберите карту для оплаты
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Загружаем карты...</p>
              </div>
            ) : savedCards.length > 0 ? (
              <div className="space-y-3">
                {savedCards.map(card => (
                  <label
                    key={card.card_id}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedCard?.card_id === card.card_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="card"
                      value={card.card_id}
                      checked={selectedCard?.card_id === card.card_id}
                      onChange={() => setSelectedCard(card)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💳</span>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Карта {card.mask}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Сохраненная банковская карта
                        </p>
                      </div>
                    </div>
                    {selectedCard?.card_id === card.card_id && (
                      <div className="ml-auto">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💳</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Нет сохраненных карт
                </h4>
                <p className="text-gray-600 mb-4">
                  Добавьте банковскую карту в профиле
                </p>
                <button
                  onClick={onClose}
                  className="text-blue-600 underline hover:text-blue-700 transition-colors"
                >
                  Перейти в профиль
                </button>
              </div>
            )}
          </div>

          {/* Ошибка */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <span className="text-red-500 text-lg">⚠️</span>
                <div>
                  <h4 className="font-medium text-red-800 mb-1">
                    Ошибка оплаты
                  </h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={paymentLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              onClick={processPayment}
              disabled={
                paymentLoading || !selectedCard || savedCards.length === 0
              }
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Оплачиваем...</span>
                </div>
              ) : (
                `Оплатить ${order.total_cost} ₸`
              )}
            </button>
          </div>

          {/* Информация о безопасности */}
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-green-700">
              <span>🔒</span>
              <span>Безопасная оплата через Halyk Bank</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
