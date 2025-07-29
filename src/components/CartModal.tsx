import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

// Локальный placeholder для изображений
const DEFAULT_THUMB_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAyNEgzNlY0MEgyOFYyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHR4dCB4PSIzMiIgeT0iNDgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSIjNkI3Mjg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7QndC10YIg0YTQvtGC0L48L3R4dD4KPC9zdmc+'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  if (!isOpen) return null

  const totalPrice = getTotalPrice()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              🛒 Корзина
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col max-h-[70vh]">
          {items.length > 0 ? (
            <>
              {/* Items list */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.item_id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                      {/* Image */}
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_THUMB_IMAGE
                        }}
                      />
                      
                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Код: {item.code}
                        </p>
                        
                        {/* Selected options */}
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="mt-1">
                            {item.selectedOptions.map((option, index) => (
                              <p key={index} className="text-xs text-blue-600 font-medium">
                                Опция: {option.variant.parent_item_amount} шт. | 
                                {option.variant.price_type === 'ADD' ? ' +' : ' '}{option.variant.price} ₸
                              </p>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          В наличии: {item.amount} шт.
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} {item.unit} за штуку
                        </p>
                        <p className="text-lg font-bold text-primary-600">
                          {(item.price / 1).toFixed(2)} ₸
                        </p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.item_id, item.cartQuantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.cartQuantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.item_id, item.cartQuantity + 1)}
                          disabled={item.cartQuantity >= item.amount}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-gray-600 ${
                            item.cartQuantity >= item.amount 
                              ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeItem(item.item_id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      {/* Total for this item */}
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {((item.price * item.cartQuantity) / 1).toFixed(2)} ₸
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                {/* Total */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-semibold text-gray-900">
                    Итого:
                  </span>
                  <span className="text-2xl font-bold text-primary-600">
                    {(totalPrice / 1).toFixed(2)} ₸
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Очистить корзину
                  </button>
                  <button 
                    onClick={() => {
                      if (isAuthenticated) {
                        // Переходим на страницу оформления заказа
                        onClose() // Закрываем модальное окно
                        navigate('/checkout')
                      } else {
                        // Нужна авторизация
                        setIsAuthModalOpen(true)
                      }
                    }}
                    className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Оформить заказ
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty cart */
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Корзина пуста
              </h3>
              <p className="text-gray-600 mb-6">
                Добавьте товары в корзину для оформления заказа
              </p>
              <button
                onClick={onClose}
                className="btn btn-primary"
              >
                Продолжить покупки
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно авторизации */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false)
          // После успешной авторизации можно автоматически оформить заказ
          console.log('Пользователь авторизован, можно оформлять заказ')
        }}
      />
    </div>
  )
}
