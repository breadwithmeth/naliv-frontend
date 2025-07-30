import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface Business {
  id: number
  name: string
  description: string
  address: string
  lat: number
  lon: number
  logo: string
  img: string
  city_id: number
  city_name: string
  enabled: number
  created_at: string
}

interface ApiResponse {
  success: boolean
  data: {
    businesses: Business[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      total_pages: number
    }
    filters: Record<string, unknown>
  }
  message: string
}

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:3000/api/businesses')
        const data: ApiResponse = await response.json()

        if (data.success) {
          setBusinesses(data.data.businesses)
          // Автоматически выбираем первый магазин
          if (data.data.businesses.length > 0) {
            setSelectedBusiness(data.data.businesses[0])
          }
        } else {
          setError('Ошибка загрузки магазинов')
        }
      } catch (err) {
        setError('Не удалось подключиться к серверу')
        console.error('Error fetching businesses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [])
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

      {/* Выбор магазина */}
      <div className="mb-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Выберите ближайший магазин
        </h2>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Загружаем магазины...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && businesses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map(business => (
              <div
                key={business.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedBusiness?.id === business.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 bg-white'
                }`}
                onClick={() => setSelectedBusiness(business)}
              >
                <div className="flex items-center space-x-3">
                  {business.logo && (
                    <img
                      src={business.logo}
                      alt={business.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={e => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {business.name}
                    </h3>
                    <p className="text-sm text-gray-600">{business.address}</p>
                  </div>
                  {selectedBusiness?.id === business.id && (
                    <div className="text-primary-600">✓</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedBusiness && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📍 Выбранный магазин: {selectedBusiness.name}
            </h3>
            <p className="text-gray-600 mb-4">{selectedBusiness.address}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="btn btn-primary">🚚 Заказать доставку</button>
              <button className="btn btn-secondary">
                📱 Связаться с магазином
              </button>
              <button className="btn btn-secondary">
                🗺️ Показать на карте
              </button>
            </div>
          </div>
        )}

        {/* Кнопка перехода к категориям */}
        {selectedBusiness && (
          <div className="mt-8 text-center">
            <Link
              to={`/category/${selectedBusiness.id}`}
              className="btn btn-primary text-lg px-8 py-3"
            >
              🛒 Посмотреть категории товаров
            </Link>
          </div>
        )}
      </div>

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
            Все магазины
          </Link>
          <Link to="/catalog" className="btn btn-secondary">
            Каталог товаров
          </Link>
        </div>
      </div>
    </div>
  )
}
