import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function CardFailure() {
  const navigate = useNavigate()
  const location = useLocation()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    // Уведомляем об ошибке добавления карты через localStorage
    localStorage.setItem('cardAdded', 'failure')
    
    // Таймер для автоматического перенаправления
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/checkout')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  // Получаем параметры из URL
  const urlParams = new URLSearchParams(location.search)
  const errorCode = urlParams.get('errorCode')
  const errorMessage = urlParams.get('errorMessage')

  // Определяем сообщение об ошибке
  const getErrorMessage = () => {
    if (errorMessage) {
      return decodeURIComponent(errorMessage)
    }
    
    switch (errorCode) {
      case 'PAYMENT_DECLINED':
        return 'Банк отклонил операцию. Проверьте данные карты.'
      case 'INSUFFICIENT_FUNDS':
        return 'Недостаточно средств на карте.'
      case 'CARD_EXPIRED':
        return 'Срок действия карты истек.'
      case 'INVALID_CARD':
        return 'Неверные данные карты.'
      case 'USER_CANCELLED':
        return 'Операция была отменена пользователем.'
      default:
        return 'Не удалось добавить карту. Попробуйте еще раз.'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
          {/* Иконка ошибки */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* Заголовок */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Не удалось добавить карту
          </h1>

          {/* Описание ошибки */}
          <p className="text-gray-600 mb-6">
            {getErrorMessage()}
          </p>

          {/* Информация об ошибке */}
          {errorCode && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-sm text-red-500 mb-1">Код ошибки:</p>
              <p className="font-mono text-sm text-red-700">{errorCode}</p>
            </div>
          )}

          {/* Советы по решению */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 text-left">
            <h3 className="font-medium text-yellow-800 mb-2">Возможные решения:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Проверьте правильность данных карты</li>
              <li>• Убедитесь, что карта активна</li>
              <li>• Проверьте лимиты по карте</li>
              <li>• Обратитесь в банк при необходимости</li>
            </ul>
          </div>

          {/* Автоматическое перенаправление */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <p className="text-blue-800 text-sm">
              Автоматическое перенаправление через {countdown} сек.
            </p>
          </div>

          {/* Кнопки */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-2xl transition-colors"
            >
              Попробовать еще раз
            </button>
            
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-2xl transition-colors"
            >
              Продолжить без сохранения карты
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
