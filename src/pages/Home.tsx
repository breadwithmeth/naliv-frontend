export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Добро пожаловать в Naliv Frontend
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Современное React приложение с TypeScript, Vite, Tailwind CSS и лучшими
        практиками разработки.
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ⚡ Vite
            </h3>
            <p className="text-gray-600">Быстрая сборка и hot reload</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎨 Tailwind CSS
            </h3>
            <p className="text-gray-600">Utility-first CSS фреймворк</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🔧 TypeScript
            </h3>
            <p className="text-gray-600">Типизированный JavaScript</p>
          </div>
        </div>
        <div className="mt-8">
          <button className="btn btn-primary mr-4">Начать работу</button>
          <button className="btn btn-secondary">Документация</button>
        </div>
      </div>
    </div>
  )
}
