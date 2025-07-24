import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Добро пожаловать в сеть бар-маркетов
        <span className="block text-primary-600 mt-2">Налив • Градусы24</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Лучший выбор алкогольных напитков по доступным ценам. Работаем
        круглосуточно для вашего удобства.
      </p>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🍷 Широкий ассортимент
            </h3>
            <p className="text-gray-600">
              Вино, пиво, крепкие напитки от лучших производителей
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🕐 24/7
            </h3>
            <p className="text-gray-600">Работаем круглосуточно без выходных</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              � Выгодные цены
            </h3>
            <p className="text-gray-600">
              Лучшие цены на алкогольную продукцию в городе
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-8 rounded-xl max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Наши преимущества
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                🚚 Быстрая доставка
              </h4>
              <p className="text-gray-600">Доставка по городу за 30 минут</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                🏪 Удобные локации
              </h4>
              <p className="text-gray-600">
                Магазины в центре и спальных районах
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                💳 Любые способы оплаты
              </h4>
              <p className="text-gray-600">Наличные, карты, онлайн-платежи</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                📱 Мобильное приложение
              </h4>
              <p className="text-gray-600">
                Заказывайте через приложение с акциями
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/stores" className="btn btn-primary mr-4">
            Найти магазин
          </Link>
          <Link to="/catalog" className="btn btn-secondary">
            Каталог товаров
          </Link>
        </div>
      </div>
    </div>
  )
}
