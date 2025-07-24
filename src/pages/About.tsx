export default function About() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">О проекте</h1>
      <div className="prose prose-lg">
        <p className="text-gray-600 mb-4">
          Naliv Frontend — это современное React приложение, созданное с
          использованием лучших практик веб-разработки. Проект настроен для
          продуктивной командной работы и готов к развёртыванию в production.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
          Технологический стек
        </h2>
        <ul className="space-y-2 text-gray-600">
          <li>
            • <strong>React 18</strong> — библиотека для создания
            пользовательских интерфейсов
          </li>
          <li>
            • <strong>TypeScript</strong> — типизированный JavaScript для
            надёжного кода
          </li>
          <li>
            • <strong>Vite</strong> — быстрый инструмент сборки и разработки
          </li>
          <li>
            • <strong>Tailwind CSS</strong> — utility-first CSS фреймворк
          </li>
          <li>
            • <strong>React Router v6</strong> — маршрутизация в приложении
          </li>
          <li>
            • <strong>ESLint + Prettier</strong> — линтинг и форматирование кода
          </li>
          <li>
            • <strong>Husky</strong> — Git хуки для проверки кода перед коммитом
          </li>
          <li>
            • <strong>Puppeteer</strong> — автоматизация браузера для
            тестирования
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
          Особенности
        </h2>
        <ul className="space-y-2 text-gray-600">
          <li>• Настроенная среда разработки с hot reload</li>
          <li>• Автоматическая проверка кода при коммитах</li>
          <li>• Responsive дизайн с Tailwind CSS</li>
          <li>• TypeScript для типобезопасности</li>
          <li>• Готовность к production деплою</li>
        </ul>
      </div>
    </div>
  )
}
