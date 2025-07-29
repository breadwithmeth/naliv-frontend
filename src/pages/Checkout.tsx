import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAddress } from '../contexts/AddressContext'
import { useBusiness } from '../contexts/BusinessContext'
import { useAuth } from '../contexts/AuthContext'

// Локальный placeholder для изображений
const DEFAULT_SMALL_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMSAxOEgyN1YzMEgyMVYxOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHR4dCB4PSIyNCIgeT0iMzYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSIjNkI3Mjg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7QndC10YIg0YTQvtGC0L48L3R4dD4KPC9zdmc+'

interface DeliveryMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedTime: string
}

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: string
}



interface DeliveryCalculationResponse {
  success: boolean
  data: {
    delivery_type: string
    distance: number
    delivery_cost: number
    zone_name: string
    coordinates: {
      lat: number
      lon: number
    }
    address: {
      address_id: number
      name: string
      address: string
      apartment?: string
      entrance?: string
      floor?: string
      other?: string
    }
  }
  message: string
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items: cartItems, getTotalPrice, clearCart } = useCart()
  const { getSelectedAddress, addresses } = useAddress()
  const { selectedBusiness } = useBusiness()
  const { user, isAuthenticated } = useAuth()
  
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string>('delivery')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card')
  const [comment, setComment] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [deliveryCalculation, setDeliveryCalculation] = useState<DeliveryCalculationResponse | null>(null)
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false)
  const [deliveryError, setDeliveryError] = useState<string | null>(null)

  const selectedAddress = getSelectedAddress() || addresses[0]

  // Функция для расчета стоимости доставки
  const calculateDelivery = async () => {
    if (!selectedBusiness || !selectedAddress || selectedDeliveryMethod !== 'delivery') {
      setDeliveryCalculation(null)
      setDeliveryError(null)
      return
    }

    try {
      setIsCalculatingDelivery(true)
      setDeliveryError(null)
      const response = await fetch(
        `http://localhost:3000/api/delivery/calculate-by-address?business_id=${selectedBusiness.id}&address_id=${selectedAddress.address_id}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: DeliveryCalculationResponse = await response.json()
      
      if (data.success) {
        setDeliveryCalculation(data)
        setDeliveryError(null)
      } else {
        console.error('Delivery calculation failed:', data.message)
        setDeliveryCalculation(null)
        setDeliveryError(data.message || 'Не удалось рассчитать стоимость доставки')
        
        // Автоматически переключаемся на самовывоз, если доставка недоступна
        if (selectedDeliveryMethod === 'delivery') {
          console.log('Переключаемся на самовывоз из-за недоступности доставки')
          setSelectedDeliveryMethod('pickup')
        }
      }
    } catch (error) {
      console.error('Error calculating delivery:', error)
      setDeliveryCalculation(null)
      setDeliveryError('Ошибка при расчете доставки. Попробуйте позже.')
      
      // Автоматически переключаемся на самовывоз при ошибке расчета доставки
      if (selectedDeliveryMethod === 'delivery') {
        console.log('Переключаемся на самовывоз из-за ошибки расчета доставки')
        setSelectedDeliveryMethod('pickup')
      }
    } finally {
      setIsCalculatingDelivery(false)
    }
  }

  // Функция для загрузки сохраненных карт - удалена (не нужна)

  const deliveryMethods: DeliveryMethod[] = [
    {
      id: 'delivery',
      name: 'Доставка',
      description: deliveryError ? 
        deliveryError.includes('зон') || deliveryError.includes('недоступ') ? 
          'Адрес находится вне зоны доставки' :
          'Ошибка расчета доставки' :
        deliveryCalculation?.data ? 
          `Доставка в ${deliveryCalculation.data.zone_name || 'неизвестную зону'} (${deliveryCalculation.data.distance?.toFixed(1) || '0'} км)` :
          'Доставим по указанному адресу',
      price: deliveryCalculation?.data?.delivery_cost || 0,
      estimatedTime: '30-60 мин'
    },
    {
      id: 'pickup',
      name: 'Самовывоз',
      description: deliveryError ? 
        'Единственный доступный способ получения' :
        'Заберите заказ в магазине',
      price: 0,
      estimatedTime: '15-30 мин'
    }
  ]

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Оплата картой',
      description: 'Безопасная оплата банковской картой',
      icon: '💳'
    }
  ]

  // Проверяем, что корзина не пуста
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart')
    }
  }, [cartItems, navigate])

  // Проверяем авторизацию
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/checkout')
    }
  }, [isAuthenticated, navigate])

  // Рассчитываем стоимость доставки при изменении адреса или магазина
  useEffect(() => {
    if (selectedBusiness && selectedAddress && selectedDeliveryMethod === 'delivery') {
      calculateDelivery()
    } else {
      setDeliveryCalculation(null)
    }
  }, [selectedBusiness?.id, selectedAddress?.address_id, selectedDeliveryMethod])

  // Загружаем сохраненные карты при авторизации - удален (не нужен)

  // Обрабатываем возврат после добавления карты - удален (не нужен)

  const selectedDelivery = deliveryMethods.find(method => method.id === selectedDeliveryMethod)
  const subtotal = getTotalPrice()
  const deliveryPrice = selectedDeliveryMethod === 'delivery' && deliveryCalculation?.data 
    ? deliveryCalculation.data.delivery_cost 
    : selectedDelivery?.price || 0
  const total = subtotal + deliveryPrice

  const handlePlaceOrder = async () => {
    if (!selectedBusiness || !user) {
      alert('Ошибка: не выбран магазин или пользователь не авторизован')
      return
    }

    setIsProcessing(true)

    try {
      // Подготавливаем данные для создания заказа согласно новому API
      const orderData = {
        business_id: selectedBusiness.id,
        items: cartItems.map(item => ({
          item_id: item.item_id,
          amount: item.cartQuantity,
          options: item.selectedOptions?.map(option => ({
            option_item_relation_id: option.variant.relation_id,
            price: option.variant.price,
            parent_amount: option.variant.parent_item_amount || 1
          })) || []
        })),
        delivery: selectedDeliveryMethod === 'delivery',
        bonus: false, // Пока не используем бонусы
        extra: comment || undefined
        // card_id удален - выбор карты будет на странице оплаты
      }

      console.log('Создание заказа:', orderData)

      // Отправляем запрос на создание заказа (без автоматической оплаты)
      const response = await fetch('http://localhost:3000/api/orders/create-user-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        console.log('Заказ создан:', result.data)
        
        // Очищаем корзину после создания заказа
        clearCart()
        
        // Показываем уведомление об успешном создании заказа
        alert(`✅ Заказ #${result.data.order_id} успешно создан!\nUUID: ${result.data.order_uuid}`)
        
        // Переходим на страницу выбора метода оплаты
        navigate(`/order-payment/${result.data.order_id}`)
      } else {
        throw new Error(result.error?.message || 'Ошибка создания заказа')
      }

    } catch (error) {
      console.error('Ошибка при создании заказа:', error)
      alert(`Произошла ошибка при оформлении заказа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  if (cartItems.length === 0) {
    return null // Будет редирект на /cart
  }

  if (!isAuthenticated) {
    return null // Будет редирект на /auth
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">
          Оформление заказа
        </h1>
        <p className="text-gray-600 mb-4">
          Проверьте данные заказа и подтвердите оформление
        </p>
        
        {/* Информация о выбранном магазине */}
        {selectedBusiness && (
          <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-2xl border border-blue-200">
            <span className="text-blue-600 mr-2">🏪</span>
            <div className="text-left">
              <div className="text-sm font-medium text-blue-900">{selectedBusiness.name}</div>
              <div className="text-xs text-blue-700">
                {selectedBusiness.city_name && `${selectedBusiness.city_name}, `}{selectedBusiness.address}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка - форма */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Способ получения */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Способ получения
              {isCalculatingDelivery && (
                <span className="ml-2 text-sm text-blue-600">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-1"></span>
                  Рассчитываем доставку...
                </span>
              )}
            </h2>
            <div className="space-y-3">
              {deliveryMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-4 rounded-2xl border transition-all ${
                    selectedDeliveryMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    (isCalculatingDelivery && method.id === 'delivery') || 
                    (!!deliveryError && method.id === 'delivery') ? 
                      'opacity-70' : ''
                  } ${
                    (!!deliveryError && method.id === 'delivery') ? 
                      'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value={method.id}
                    checked={selectedDeliveryMethod === method.id}
                    onChange={(e) => setSelectedDeliveryMethod(e.target.value)}
                    className="sr-only"
                    disabled={
                      (isCalculatingDelivery && method.id === 'delivery') ||
                      (!!deliveryError && method.id === 'delivery')
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{method.name}</h3>
                      <span className="text-lg font-semibold text-gray-900">
                        {method.id === 'delivery' && isCalculatingDelivery ? (
                          '...'
                        ) : method.price === 0 ? (
                          'Бесплатно'
                        ) : (
                          `${method.price} ₸`
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                    <p className="text-sm text-blue-600 mt-1">⏱ {method.estimatedTime}</p>
                    {method.id === 'delivery' && deliveryError && (
                      <p className="text-sm text-red-600 mt-1">⚠️ {deliveryError}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
            
            {/* Уведомление о доступности доставки */}
            {selectedDeliveryMethod === 'pickup' && !deliveryError && deliveryCalculation && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 text-lg">✅</span>
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">
                      Доставка доступна
                    </h4>
                    <p className="text-sm text-green-700 mb-2">
                      Доставка в {deliveryCalculation.data.zone_name} доступна за {deliveryCalculation.data.delivery_cost} ₸
                    </p>
                    <button
                      onClick={() => setSelectedDeliveryMethod('delivery')}
                      className="text-sm text-green-600 underline hover:text-green-700 transition-colors"
                    >
                      Переключиться на доставку
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Уведомление о недоступности доставки */}
            {deliveryError && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <span className="text-orange-500 text-lg">⚠️</span>
                  <div>
                    <h4 className="font-medium text-orange-800 mb-1">
                      Доставка недоступна
                    </h4>
                    <p className="text-sm text-orange-700 mb-2">
                      {deliveryError}
                    </p>
                    <p className="text-sm text-orange-600">
                      Вы можете забрать заказ самовывозом из магазина бесплатно.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Адрес доставки (если выбрана доставка) */}
          {selectedDeliveryMethod === 'delivery' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Адрес доставки
              </h2>
              {selectedAddress ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-green-800">{selectedAddress.name}</h3>
                      <p className="text-green-700 mt-1">{selectedAddress.address}</p>
                      {selectedAddress.apartment && (
                        <p className="text-green-600 text-sm mt-1">
                          Кв. {selectedAddress.apartment}
                          {selectedAddress.entrance && `, подъезд ${selectedAddress.entrance}`}
                          {selectedAddress.floor && `, этаж ${selectedAddress.floor}`}
                        </p>
                      )}
                      {selectedAddress.other && (
                        <p className="text-green-600 text-sm mt-1">{selectedAddress.other}</p>
                      )}
                      
                      {/* Информация о доставке из API */}
                      {deliveryCalculation?.data && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-green-600">
                              📍 {deliveryCalculation.data.zone_name || 'Неизвестная зона'}
                            </span>
                            <span className="text-green-600">
                              📏 {deliveryCalculation.data.distance?.toFixed(1) || '0'} км
                            </span>
                            <span className="text-green-600">
                              💰 {deliveryCalculation.data.delivery_cost || 0} ₸
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Link
                      to="/profile"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Изменить
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <p className="text-yellow-800">
                    Адрес доставки не указан
                  </p>
                  <Link
                    to="/profile"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                  >
                    Добавить адрес
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Пункт самовывоза (если выбран самовывоз) */}
          {selectedDeliveryMethod === 'pickup' && selectedBusiness && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Пункт самовывоза
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <h3 className="font-medium text-blue-800">{selectedBusiness.name}</h3>
                <p className="text-blue-700 mt-1">
                  {selectedBusiness.city_name && `${selectedBusiness.city_name}, `}{selectedBusiness.address}
                </p>
              </div>
            </div>
          )}

          {/* Способ оплаты */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Способ оплаты
            </h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{method.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>



          {/* Комментарий к заказу */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Комментарий к заказу
            </h2>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Дополнительные пожелания или инструкции для доставки..."
              className="w-full p-4 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>
        </div>

        {/* Правая колонка - сводка заказа */}
        <div className="space-y-6">
          {/* Товары в заказе */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ваш заказ ({cartItems.length} товаров)
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cartItems.map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_SMALL_IMAGE
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {item.cartQuantity} × {item.price.toFixed(2)} ₸
                    </p>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <p className="text-xs text-blue-600">
                        +опции
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {(item.price * item.cartQuantity).toFixed(2)} ₸
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Информация об оплате */}
          {selectedPaymentMethod === 'card' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Способ оплаты
              </h2>
              <div className="flex items-center">
                <span className="text-2xl mr-3">💳</span>
                <div>
                  <p className="font-medium text-gray-900">Оплата картой</p>
                  <p className="text-sm text-gray-600">Выбор карты на следующем шаге</p>
                </div>
              </div>
            </div>
          )}

          {/* Итого */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Итого
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Товары:</span>
                <span className="font-medium">{subtotal.toFixed(2)} ₸</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Доставка:</span>
                <span className="font-medium">
                  {deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice} ₸`}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>К оплате:</span>
                  <span className="text-blue-600">{total.toFixed(2)} ₸</span>
                </div>
              </div>
            </div>



            {/* Кнопка оформления */}
            <button
              onClick={handlePlaceOrder}
              disabled={
                isProcessing || 
                (selectedDeliveryMethod === 'delivery' && !selectedAddress) ||
                (selectedDeliveryMethod === 'delivery' && !!deliveryError) ||
                (selectedDeliveryMethod === 'delivery' && isCalculatingDelivery)
              }
              className={`w-full mt-6 py-4 rounded-2xl font-medium transition-all ${
                isProcessing || 
                (selectedDeliveryMethod === 'delivery' && !selectedAddress) ||
                (selectedDeliveryMethod === 'delivery' && !!deliveryError) ||
                (selectedDeliveryMethod === 'delivery' && isCalculatingDelivery)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl active:scale-95'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Создаем заказ...</span>
                </div>
              ) : isCalculatingDelivery && selectedDeliveryMethod === 'delivery' ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                  <span>Рассчитываем доставку...</span>
                </div>
              ) : (
                `Создать заказ на ${total.toFixed(2)} ₸`
              )}
            </button>

            {selectedDeliveryMethod === 'delivery' && !selectedAddress && (
              <p className="text-red-600 text-sm mt-2 text-center">
                Укажите адрес доставки для продолжения
              </p>
            )}
            
            {selectedDeliveryMethod === 'delivery' && deliveryError && (
              <p className="text-red-600 text-sm mt-2 text-center">
                {deliveryError}
              </p>
            )}
          </div>

          {/* Ссылка обратно в корзину */}
          <div className="text-center">
            <Link
              to="/cart"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Вернуться в корзину
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
