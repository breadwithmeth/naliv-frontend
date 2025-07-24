export default function Catalog() {
  const categories = [
    {
      name: '🍷 Вино',
      description: 'Красное, белое, розовое, игристое',
      items: ['Шардоне', 'Каберне Совиньон', 'Пино Нуар', 'Просекко'],
    },
    {
      name: '🍺 Пиво',
      description: 'Светлое, тёмное, крафтовое',
      items: ['Балтика', 'Хейнекен', 'Стелла Артуа', 'Гиннесс'],
    },
    {
      name: '🥃 Крепкие напитки',
      description: 'Водка, виски, коньяк, ром',
      items: ['Абсолют', 'Джек Дэниэлс', 'Хеннесси', 'Бакарди'],
    },
    {
      name: '🍾 Игристые вина',
      description: 'Шампанское и игристые вина',
      items: ['Дом Периньон', 'Кристал', 'Советское шампанское', 'Абрау-Дюрсо'],
    },
    {
      name: '🍹 Ликёры',
      description: 'Сладкие и полусладкие ликёры',
      items: ['Бейлис', 'Калуа', 'Амаретто', 'Самбука'],
    },
    {
      name: '🍯 Настойки',
      description: 'Травяные и ягодные настойки',
      items: ['Егермейстер', 'Бехеровка', 'Кедровка', 'Хреновуха'],
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Каталог товаров
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Широкий ассортимент качественных алкогольных напитков для любого
          случая
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {category.name}
            </h3>
            <p className="text-gray-600 mb-4">{category.description}</p>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Популярные бренды:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <button className="mt-4 w-full btn btn-primary">
              Посмотреть все
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-r from-primary-50 to-primary-100 p-8 rounded-xl text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Не нашли то, что искали?
        </h2>
        <p className="text-gray-600 mb-6">
          Свяжитесь с нами, и мы поможем найти нужный товар или закажем его
          специально для вас
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn btn-primary">📞 Позвонить консультанту</button>
          <button className="btn btn-secondary">💬 Написать в чат</button>
        </div>
      </div>
    </div>
  )
}
