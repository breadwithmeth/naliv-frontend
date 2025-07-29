import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface Card {
  card_id: number
  mask: string
}

interface CardsResponse {
  success: boolean
  data: {
    cards: Card[]
    total: number
  }
  message: string
}

interface PaymentResponse {
  success: boolean
  data: {
    order_id: number
    payment_type: string
    payment_result: {
      status: string
      payment_id?: string
      payment_url?: string
      expires_at?: string
      code?: number
      info?: string
      error_detail?: string
      bank_response?: any
    }
  }
  message: string
}

export default function OrderPayment() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  
  const [order, setOrder] = useState<any>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('card')
  const [loading, setLoading] = useState(false)
  const [isLoadingCards, setIsLoadingCards] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Проверяем авторизацию
  useEffect(() => {
    console.log('Auth useEffect triggered - isAuthenticated:', isAuthenticated)
    console.log('Auth useEffect triggered - user:', user)
    if (!isAuthenticated) {
      console.log('User not authenticated, would redirect to /auth')
      // Временно отключаем редирект
      // navigate('/auth')
    }
  }, [isAuthenticated, navigate])

  // Загрузка информации о заказе
  const loadOrder = async () => {
    if (!orderId || !user) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: any = await response.json()

      if (result.success) {
        // Заказ находится в result.data.order, а не в result.data
        const orderData = result.data.order
        setOrder(orderData)
      } else {
        throw new Error(result.message || 'Не удалось загрузить информацию о заказе')
      }
    } catch (error) {
      console.error('Error loading order:', error)
      setError(error instanceof Error ? error.message : 'Произошла ошибка при загрузке заказа')
    } finally {
      setLoading(false)
    }
  }

  // Загрузка сохраненных карт
  const loadCards = async () => {
    if (!user) return

    try {
      setIsLoadingCards(true)
      const response = await fetch('http://localhost:3000/api/user/cards', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: CardsResponse = await response.json()

      if (result.success) {
        setCards(result.data.cards)
        // Автоматически выбираем первую карту
        if (result.data.cards.length > 0) {
          setSelectedCard(result.data.cards[0])
        }
      } else {
        console.error('Failed to load cards:', result.message)
        setCards([])
      }
    } catch (error) {
      console.error('Error loading cards:', error)
      setCards([])
    } finally {
      setIsLoadingCards(false)
    }
  }

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    loadOrder()
    loadCards()
  }, [orderId, user])

  // Процесс оплаты
  const handlePayment = async () => {
    if (!orderId) return

    if (selectedPaymentType === 'card' && !selectedCard) {
      alert('Выберите карту для оплаты')
      return
    }

    setIsProcessing(true)

    try {
      const paymentData = selectedPaymentType === 'card' 
        ? {
            payment_type: 'card',
            card_id: selectedCard!.card_id
          }
        : {
            payment_type: 'page'
          }

      console.log('Инициируем оплату:', paymentData)

      const response = await fetch(`http://localhost:3000/api/orders/${orderId}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: PaymentResponse = await response.json()

      if (result.success) {
        const { payment_result } = result.data

        if (payment_result.status === 'ok') {
          // Успешная оплата сохраненной картой
          alert('✅ Заказ успешно оплачен!')
          navigate('/payment-success')
        } else if (payment_result.status === 'redirect') {
          // Перенаправление на страницу банка
          if (payment_result.payment_url) {
            window.location.href = payment_result.payment_url
          } else {
            throw new Error('Не получена ссылка для оплаты')
          }
        } else {
          // Ошибка оплаты
          const errorMessage = payment_result.info || payment_result.error_detail || 'Ошибка при оплате'
          alert(`❌ ${errorMessage}`)
        }
      } else {
        throw new Error(result.message || 'Ошибка при обработке платежа')
      }

    } catch (error) {
      console.error('Payment error:', error)
      alert(`Произошла ошибка при оплате: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Отладка авторизации</h2>
          <div className="text-left bg-gray-100 rounded-lg p-4 mb-4">
            <p><strong>isAuthenticated:</strong> {String(isAuthenticated)}</p>
            <p><strong>user:</strong> {user ? JSON.stringify(user) : 'null'}</p>
            <p><strong>token:</strong> {localStorage.getItem('token') ? 'есть' : 'нет'}</p>
          </div>
          <Link
            to="/auth"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Войти в систему
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Загружаем информацию о заказе...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ошибка</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            to="/unpaid-orders"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к заказам
          </Link>
        </div>
      </div>
    )
  }

  if (!order || !order.order_id) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📦</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Заказ не найден</h2>
          <p className="text-gray-600 mb-8">Заказ с указанным ID не существует или был удален</p>
          <Link
            to="/unpaid-orders"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к заказам
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Хлебные крошки */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li><Link to="/" className="hover:text-blue-600 transition-colors">Главная</Link></li>
          <li className="text-gray-300">/</li>
          <li><Link to="/unpaid-orders" className="hover:text-blue-600 transition-colors">Неоплаченные заказы</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-gray-900 font-medium">Оплата заказа #{order?.order_id || 'N/A'}</li>
        </ol>
      </nav>

      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Оплата заказа #{order?.order_id || 'N/A'}
        </h1>
        <p className="text-gray-600">
          Выберите способ оплаты для завершения заказа
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка - способы оплаты */}
        <div className="lg:col-span-2 space-y-6">
          {/* Выбор способа оплаты */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Способы оплаты
            </h2>

            <div className="space-y-4">
              {/* Оплата сохраненной картой */}
              <label className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                selectedPaymentType === 'card'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="payment_type"
                  value="card"
                  checked={selectedPaymentType === 'card'}
                  onChange={(e) => setSelectedPaymentType(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentType === 'card'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPaymentType === 'card' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      💳 Оплата сохраненной картой
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Мгновенное списание с сохраненной банковской карты
                    </p>

                    {selectedPaymentType === 'card' && (
                      <div className="mt-4">
                        {isLoadingCards ? (
                          <div className="flex items-center text-gray-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Загружаем карты...
                          </div>
                        ) : cards.length > 0 ? (
                          <div className="space-y-2">
                            {cards.map((card) => (
                              <label
                                key={card.card_id}
                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                                  selectedCard?.card_id === card.card_id
                                    ? 'border-blue-300 bg-blue-25'
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
                                <span className="text-lg mr-3">💳</span>
                                <div>
                                  <p className="font-medium text-gray-900">Карта {card.mask}</p>
                                  <p className="text-sm text-gray-600">Сохраненная карта</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-600 mb-2">Нет сохраненных карт</p>
                            <Link
                              to="/profile"
                              className="text-blue-600 underline hover:text-blue-700 text-sm"
                            >
                              Добавить карту в профиле
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </label>

              {/* Оплата через страницу банка */}
              <label className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                selectedPaymentType === 'page'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="payment_type"
                  value="page"
                  checked={selectedPaymentType === 'page'}
                  onChange={(e) => setSelectedPaymentType(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentType === 'page'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPaymentType === 'page' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      🌐 Оплата через страницу банка
                    </h3>
                    <p className="text-sm text-gray-600">
                      Переход на защищенную страницу Halyk Bank для ввода данных карты
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Правая колонка - информация о заказе */}
        <div className="space-y-6">
          {/* Информация о заказе */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Детали заказа
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Номер заказа:</span>
                <span className="font-medium">#{order?.order_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Товаров:</span>
                <span className="font-medium">{order?.items?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Доставка:</span>
                <span className="font-medium">
                  {(order?.delivery_price || 0) === 0 ? 'Бесплатно' : `${order?.delivery_price || 0} ₸`}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>К оплате:</span>
                  <span className="text-blue-600">
                    {order?.items ? 
                      (order.items.reduce((total: number, item: any) => total + (parseFloat(item.price) * parseInt(item.amount)), 0) + (order.delivery_price || 0)).toFixed(0)
                      : '0'
                    } ₸
                  </span>
                </div>
              </div>
            </div>

            {/* Информация о магазине */}
            {order?.business && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Магазин</h3>
                <p className="text-sm text-gray-600">{order.business.name}</p>
                <p className="text-xs text-gray-500">
                  {order.business.city_name && `${order.business.city_name}, `}{order.business.address}
                </p>
              </div>
            )}

            {/* Кнопка оплаты */}
            <button
              onClick={handlePayment}
              disabled={
                isProcessing ||
                (selectedPaymentType === 'card' && (!selectedCard || cards.length === 0))
              }
              className={`w-full mt-6 py-3 rounded-lg font-medium transition-all ${
                isProcessing ||
                (selectedPaymentType === 'card' && (!selectedCard || cards.length === 0))
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Обрабатываем оплату...</span>
                </div>
              ) : (
                `Оплатить ${order?.items ? 
                  (order.items.reduce((total: number, item: any) => total + (parseFloat(item.price) * parseInt(item.amount)), 0) + (order.delivery_price || 0)).toFixed(0)
                  : '0'
                } ₸`
              )}
            </button>

            {selectedPaymentType === 'card' && cards.length === 0 && (
              <p className="text-red-600 text-sm mt-2 text-center">
                Добавьте карту в профиле для оплаты
              </p>
            )}
          </div>

          {/* Информация о безопасности */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-lg">🔒</span>
              <div>
                <h4 className="font-medium text-green-800 mb-1">
                  Безопасная оплата
                </h4>
                <p className="text-sm text-green-700">
                  Все платежи защищены технологией SSL и обрабатываются через защищенную систему Halyk Bank
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
