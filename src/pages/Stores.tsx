export default function Stores() {
  const stores = [
    {
      name: 'Налив на Невском',
      address: 'Невский проспект, 120',
      phone: '+7 (812) 555-01-01',
      hours: '24/7',
      features: ['🚗 Парковка', '📱 Оплата картой', '🚚 Доставка'],
    },
    {
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
      name: 'Налив на Васильевском',
      address: 'Васильевский остров, 15-я линия, 28',
      phone: '+7 (812) 555-03-03',
      hours: '24/7',
      features: ['🚇 У метро', '🍾 Элитный алкоголь', '👥 Консультант'],
    },
    {
      name: 'Градусы24 Приморский',
      address: 'Приморский район, ул. Савушкина, 67',
      phone: '+7 (812) 555-04-04',
      hours: '24/7',
      features: ['🏠 Спальный район', '🚚 Быстрая доставка', '💰 Акции'],
    },
    {
      name: 'Налив Московский',
      address: 'Московский проспект, 156',
      phone: '+7 (812) 555-05-05',
      hours: '24/7',
      features: ['🚗 Парковка', '🍺 Разливное пиво', '📦 Опт'],
    },
    {
      name: 'Градусы24 Калининский',
      address: 'пр. Просвещения, 92',
      phone: '+7 (812) 555-06-06',
      hours: '24/7',
      features: ['🏢 Новый район', '❄️ Винный погреб', '🎯 Дегустации'],
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Наши магазины</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Более 50 магазинов по всему городу. Работаем круглосуточно для вашего
          удобства
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stores.map((store, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {store.name}
            </h3>

            <div className="space-y-2 mb-4">
              <div className="flex items-start">
                <span className="text-gray-500 mr-2">📍</span>
                <span className="text-gray-600">{store.address}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">📞</span>
                <a
                  href={`tel:${store.phone}`}
                  className="text-primary-600 hover:underline"
                >
                  {store.phone}
                </a>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">⏰</span>
                <span className="text-gray-600 font-medium">{store.hours}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Особенности:</h4>
              <div className="flex flex-wrap gap-2">
                {store.features.map((feature, featureIndex) => (
                  <span
                    key={featureIndex}
                    className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 btn btn-primary text-sm py-2">
                📍 На карте
              </button>
              <button className="flex-1 btn btn-secondary text-sm py-2">
                🚚 Доставка
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-8 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Зона доставки
            </h2>
            <p className="text-gray-600 mb-4">
              Доставляем по всему городу и пригородам. Минимальная сумма заказа
              — 1000 рублей.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>
                🚚 <strong>В пределах города:</strong> 30-60 минут
              </li>
              <li>
                🏘️ <strong>Пригород:</strong> 1-2 часа
              </li>
              <li>
                💰 <strong>Стоимость:</strong> от 200 рублей
              </li>
              <li>
                🆓 <strong>Бесплатно:</strong> при заказе от 3000 рублей
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Как заказать доставку
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                  1
                </span>
                <p className="text-gray-600">
                  Выберите товары в каталоге или позвоните нам
                </p>
              </div>
              <div className="flex items-start">
                <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                  2
                </span>
                <p className="text-gray-600">
                  Укажите адрес доставки и способ оплаты
                </p>
              </div>
              <div className="flex items-start">
                <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                  3
                </span>
                <p className="text-gray-600">
                  Получите заказ у курьера с проверкой документов
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
