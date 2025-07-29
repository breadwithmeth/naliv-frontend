import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function OrderSuccess() {
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
          Заказ успешно оформлен!
        </h1>

        {/* Описание */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Спасибо за ваш заказ! Мы получили ваш заказ и начинаем его обработку. 
          В ближайшее время с вами свяжется наш менеджер для подтверждения деталей.
        </p>

        {/* Информация о заказе */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            Что происходит дальше?
          </h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 mt-1">📞</span>
              <div>
                <h3 className="font-medium text-blue-800">Подтверждение заказа</h3>
                <p className="text-blue-700 text-sm">
                  Наш менеджер свяжется с вами в течение 15 минут для подтверждения деталей
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 mt-1">🛍️</span>
              <div>
                <h3 className="font-medium text-blue-800">Сборка заказа</h3>
                <p className="text-blue-700 text-sm">
                  Мы соберем ваш заказ и подготовим его к доставке или самовывозу
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 mt-1">🚚</span>
              <div>
                <h3 className="font-medium text-blue-800">Доставка/Самовывоз</h3>
                <p className="text-blue-700 text-sm">
                  Курьер доставит заказ или вы сможете забрать его в магазине
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
            Посмотреть мои заказы
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
