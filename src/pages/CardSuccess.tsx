import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function CardSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Уведомляем об успешном добавлении карты через localStorage
    localStorage.setItem('cardAdded', 'success')
    
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
  const invoiceId = urlParams.get('invoiceId')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
          {/* Иконка успеха */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Заголовок */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Карта успешно добавлена!
          </h1>

          {/* Описание */}
          <p className="text-gray-600 mb-6">
            Ваша банковская карта была успешно сохранена и готова для использования при оплате заказов.
          </p>

          {/* Информация о транзакции */}
          {invoiceId && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Номер транзакции:</p>
              <p className="font-mono text-sm text-gray-700">{invoiceId}</p>
            </div>
          )}

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
              Продолжить оформление заказа
            </button>
            
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-2xl transition-colors"
            >
              Перейти в профиль
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
