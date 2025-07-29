import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function PaymentSuccess() {
  const navigate = useNavigate()

  useEffect(() => {
    // Автоматический редирект через 10 секунд
    const timer = setTimeout(() => {
      navigate('/')
    }, 10000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-12">
        {/* Иконка успеха */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl">✅</span>
        </div>

        {/* Заголовок */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">
          Оплата прошла успешно!
        </h1>

        {/* Описание */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Ваш заказ успешно оплачен и передан в обработку. 
          В ближайшее время мы начнем сборку и доставку вашего заказа.
        </p>

        {/* Информация о следующих шагах */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-green-800 mb-3">
            Что происходит дальше?
          </h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start space-x-3">
              <span className="text-green-600 mt-1">📧</span>
              <div>
                <h3 className="font-medium text-green-800">Подтверждение оплаты</h3>
                <p className="text-green-700 text-sm">
                  Вы получите SMS и email с подтверждением оплаты
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-600 mt-1">🛍️</span>
              <div>
                <h3 className="font-medium text-green-800">Сборка заказа</h3>
                <p className="text-green-700 text-sm">
                  Мы соберем ваш заказ и подготовим его к доставке
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-600 mt-1">🚚</span>
              <div>
                <h3 className="font-medium text-green-800">Доставка</h3>
                <p className="text-green-700 text-sm">
                  Курьер доставит заказ по указанному адресу в течение 1-2 часов
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="space-y-4">
          <Link
            to="/"
            className="btn btn-primary w-full"
          >
            Продолжить покупки
          </Link>
          <Link
            to="/profile"
            className="btn btn-secondary w-full"
          >
            Мой профиль
          </Link>
        </div>

        {/* Автоматический редирект */}
        <p className="text-gray-500 text-sm mt-6">
          Автоматическое перенаправление на главную страницу через 10 секунд
        </p>
      </div>
    </div>
  )
}
