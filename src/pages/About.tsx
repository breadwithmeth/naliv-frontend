export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        О сети бар-маркетов Налив • Градусы24
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-4">
            Сеть бар-маркетов «Налив» и «Градусы24» — это современная розничная
            сеть, специализирующаяся на продаже качественных алкогольных
            напитков. Мы работаем для того, чтобы предоставить нашим клиентам
            лучший сервис и широкий ассортимент по доступным ценам.
          </p>

          <p className="text-gray-600 mb-4">
            Наша миссия — сделать покупку алкогольных напитков максимально
            удобной, быстрой и доступной для каждого клиента в любое время
            суток.
          </p>
        </div>

        <div className="bg-primary-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Наши цифры
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Магазинов в сети:</span>
              <span className="font-semibold">50+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Довольных клиентов:</span>
              <span className="font-semibold">100,000+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Лет на рынке:</span>
              <span className="font-semibold">15+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Товарных позиций:</span>
              <span className="font-semibold">5,000+</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Наш ассортимент
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>
              🍷 <strong>Вино</strong> — красное, белое, игристое от мировых
              производителей
            </li>
            <li>
              🍺 <strong>Пиво</strong> — крафтовое, импортное, отечественное
            </li>
            <li>
              🥃 <strong>Крепкие напитки</strong> — виски, водка, коньяк, ром
            </li>
            <li>
              🍾 <strong>Шампанское</strong> — для особых случаев
            </li>
            <li>
              🍹 <strong>Ликёры</strong> — для коктейлей и дегустации
            </li>
            <li>
              🍯 <strong>Настойки</strong> — натуральные и ягодные
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Почему выбирают нас
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>
              ⏰ <strong>Круглосуточная работа</strong> — магазины открыты 24/7
            </li>
            <li>
              💰 <strong>Конкурентные цены</strong> — лучшие предложения в
              городе
            </li>
            <li>
              🚚 <strong>Быстрая доставка</strong> — привезём за 30 минут
            </li>
            <li>
              📱 <strong>Мобильное приложение</strong> — удобные заказы онлайн
            </li>
            <li>
              🎁 <strong>Программа лояльности</strong> — скидки постоянным
              клиентам
            </li>
            <li>
              ✅ <strong>Качественная продукция</strong> — только
              сертифицированные товары
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Контакты и режим работы
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📞 Телефон</h4>
            <p className="text-gray-600">8 (800) 555-НАЛИВ</p>
            <p className="text-gray-600">8 (800) 555-24-24</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              ⏰ Режим работы
            </h4>
            <p className="text-gray-600">Круглосуточно</p>
            <p className="text-gray-600">7 дней в неделю</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🌐 Онлайн</h4>
            <p className="text-gray-600">naliv24.ru</p>
            <p className="text-gray-600">gradus24.ru</p>
          </div>
        </div>
      </div>
    </div>
  )
}
