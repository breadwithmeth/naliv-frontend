export default function Stores() {
  const stores = [
    {
      id: 1,
      name: 'Налив на Невском',
      address: 'Невский проспект, 120',
      phone: '+7 (812) 555-01-01',
      hours: '24/7',
      features: ['🚗 Парковка', '📱 Оплата картой', '🚚 Доставка'],
    },
    {
      id: 2,
      name: 'Градусы24 Центральный',
      address: 'ул. Ленина, 45',
      phone: '+7 (812) 555-02-02',
      hours: '24/7',
      features: [
        '🏪 Большой зал',
        '❄️ Охлаждённые напитки',
        '🎁 Подарочные наборы',
      ],
    },
    {
      id: 3,
      name: 'Налив на Васильевском',
      address: 'Васильевский остров, 15-я линия, 28',
      phone: '+7 (812) 555-03-03',
      hours: '24/7',
      features: ['🚇 У метро', '🍾 Элитный алкоголь', '👥 Консультант'],
    },
    {
      id: 4,
      name: 'Градусы24 Приморский',
      address: 'Приморский район, ул. Савушкина, 67',
      phone: '+7 (812) 555-04-04',
      hours: '24/7',
      features: ['🏠 Спальный район', '🚚 Быстрая доставка', '💰 Акции'],
    },
    {
      id: 5,
      name: 'Налив Московский',
      address: 'Московский проспект, 156',
      phone: '+7 (812) 555-05-05',
      hours: '24/7',
      features: ['🚗 Парковка', '🍺 Разливное пиво', '📦 Опт'],
    },
    {
      id: 6,
      name: 'Градусы24 Калининский',
      address: 'пр. Просвещения, 92',
      phone: '+7 (812) 555-06-06',
      hours: '24/7',
      features: ['�� Новый район', '❄️ Винный погреб', '🎯 Дегустации'],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button 
          onClick={() => window.history.back()}
          className="mr-3"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-medium flex-1">Наши магазины</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{store.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{store.address}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-xs text-gray-600">{store.phone}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-gray-600">{store.hours}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {store.features.map((feature, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  {feature}
                </span>
              ))}
            </div>

            <div className="flex space-x-2 mt-4">
              <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium">
                Маршрут
              </button>
              <button className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium">
                Позвонить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  )
}
