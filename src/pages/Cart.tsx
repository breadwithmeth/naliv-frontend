import { useCart } from '../contexts/CartContext'
import { useBusiness } from '../contexts/BusinessContext'
import { Link } from 'react-router-dom'
import { useState } from 'react'

// Локальный placeholder для изображений
const DEFAULT_THUMB_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAyNEgzNlY0MEgyOFYyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHR4dCB4PSIzMiIgeT0iNDgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSIjNkI3Mjg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7QndC10YIg0YTQvtGC0L48L3R4dD4KPC9zdmc+'

export default function Cart() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
    saveCart,
  } = useCart()
  const { selectedBusiness } = useBusiness()
  const [isClearing, setIsClearing] = useState(false)
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  // Получаем информацию о localStorage для отладки
  const getLocalStorageInfo = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        return {
          exists: true,
          itemCount: Array.isArray(cartItems) ? cartItems.length : 0,
          rawData:
            savedCart.substring(0, 200) + (savedCart.length > 200 ? '...' : ''),
        }
      } catch (err) {
        return { exists: true, itemCount: 0, error: 'Ошибка парсинга JSON' }
      }
    }
    return { exists: false, itemCount: 0 }
  }

  const handleClearCart = () => {
    setIsClearing(true)
    setTimeout(() => {
      clearCart()
      setIsClearing(false)
    }, 300)
  }

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button onClick={() => window.history.back()} className="mr-3">
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
          <h1 className="text-lg font-medium flex-1">Корзина</h1>
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="ml-2 text-sm text-gray-500 px-2 py-1 border border-gray-300 rounded"
          >
            Debug
          </button>
        </div>

        {/* Debug Info */}
        {showDebugInfo && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <h3 className="font-medium text-yellow-800 mb-2">
              Отладочная информация
            </h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>Товаров в корзине (React): {items.length}</div>
              <div>
                localStorage:{' '}
                {(() => {
                  const info = getLocalStorageInfo()
                  return info.exists ? `${info.itemCount} товаров` : 'пусто'
                })()}
              </div>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => saveCart()}
                  className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs"
                >
                  Сохранить корзину
                </button>
                <button
                  onClick={() => localStorage.removeItem('cart')}
                  className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs"
                >
                  Очистить localStorage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              Корзина пуста
            </h2>
            <p className="text-gray-600 mb-6">Добавьте товары из каталога</p>
            <Link
              to="/catalog"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium inline-block"
            >
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button onClick={() => window.history.back()} className="mr-3">
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
        <h1 className="text-lg font-medium flex-1">Корзина</h1>
        <button
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="mr-3 text-sm text-gray-500 px-2 py-1 border border-gray-300 rounded"
        >
          Debug
        </button>
        <button
          onClick={handleClearCart}
          disabled={isClearing}
          className="text-red-500 text-sm font-medium"
        >
          {isClearing ? 'Очищаем...' : 'Очистить'}
        </button>
      </div>

      {/* Debug Info */}
      {showDebugInfo && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <h3 className="font-medium text-yellow-800 mb-2">
            Отладочная информация
          </h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>Товаров в корзине (React): {items.length}</div>
            <div>
              localStorage:{' '}
              {(() => {
                const info = getLocalStorageInfo()
                return info.exists ? `${info.itemCount} товаров` : 'пусто'
              })()}
            </div>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => saveCart()}
                className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs"
              >
                Сохранить корзину
              </button>
              <button
                onClick={() => localStorage.removeItem('cart')}
                className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs"
              >
                Очистить localStorage
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
              >
                Перезагрузить страницу
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Store Info */}
        {selectedBusiness && (
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-orange-500"
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
                <h3 className="font-medium text-gray-900 text-sm">
                  {selectedBusiness.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedBusiness.city_name &&
                    `${selectedBusiness.city_name}, `}
                  {selectedBusiness.address}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-3">
          {items.map(item => (
            <div
              key={`${item.item_id}-${JSON.stringify(item.selectedOptions)}`}
              className="bg-white rounded-lg p-4"
            >
              <div className="flex space-x-3">
                {/* Item Image */}
                <Link to={`/item/${item.item_id}`} className="flex-shrink-0">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={e => {
                      e.currentTarget.src = DEFAULT_THUMB_IMAGE
                    }}
                  />
                </Link>

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/item/${item.item_id}`}>
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                      {item.name}
                    </h4>
                  </Link>

                  {/* Options */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="mb-2">
                      {item.selectedOptions.map((option, index) => (
                        <span
                          key={index}
                          className="text-xs text-gray-500 block"
                        >
                          Опция: {option.option_id}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-lg font-bold text-gray-900">
                        {(item.price / 1).toFixed(2)} ₸
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        за {item.quantity} {item.unit}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">#{item.code}</span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.item_id,
                            (item.cartQuantity || 1) - 1
                          )
                        }
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
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
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.cartQuantity || 1}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.item_id,
                            (item.cartQuantity || 1) + 1
                          )
                        }
                        disabled={item.cartQuantity >= item.amount}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center disabled:opacity-50"
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
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.item_id)}
                      className="text-red-500 text-sm"
                    >
                      Удалить
                    </button>
                  </div>

                  {/* Total for this item */}
                  <div className="mt-2 text-right">
                    <span className="text-sm font-medium text-gray-900">
                      Итого:{' '}
                      {((item.price * (item.cartQuantity || 1)) / 1).toFixed(2)}{' '}
                      ₸
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Итого заказа</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Товары ({items.length})</span>
              <span className="font-medium">
                {getTotalPrice().toFixed(2)} ₸
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Доставка</span>
              <span className="font-medium">Рассчитается при оформлении</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-bold">Итого</span>
                <span className="text-lg font-bold text-orange-500">
                  {getTotalPrice().toFixed(2)} ₸
                </span>
              </div>
            </div>
          </div>

          {/* Additional Checkout Button */}
          <Link
            to="/checkout"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium text-center block mt-4"
          >
            Оформить заказ
          </Link>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
        <div className="flex space-x-3">
          <Link
            to="/catalog"
            className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-lg font-medium text-center"
          >
            Добавить товары
          </Link>
          <Link
            to="/checkout"
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium text-center"
          >
            Оформить заказ
          </Link>
        </div>
      </div>

      {/* Bottom Padding for Fixed Actions */}
      <div className="h-32"></div>
    </div>
  )
}
