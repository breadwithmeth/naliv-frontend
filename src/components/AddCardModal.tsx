import { useState, useEffect } from 'react'
import { useCardSaving } from '../hooks/useCardSaving'

interface AddCardProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AddCardModal({ isOpen, onClose, onSuccess }: AddCardProps) {
  const { state, initCardSave, reset } = useCardSaving()
  const [showRetryOptions, setShowRetryOptions] = useState(false)

  // Сбрасываем состояние при открытии модалки
  useEffect(() => {
    if (isOpen) {
      reset()
      setShowRetryOptions(false)
    }
  }, [isOpen, reset])

  // Обрабатываем успешное добавление карты
  useEffect(() => {
    const handleCardAdded = (event: CustomEvent) => {
      if (event.detail.success) {
        onSuccess?.()
        onClose()
      }
    }

    window.addEventListener('cardAdded', handleCardAdded as EventListener)
    return () => {
      window.removeEventListener('cardAdded', handleCardAdded as EventListener)
    }
  }, [onSuccess, onClose])

  // Показываем опции повтора через 3 секунды после ошибки
  useEffect(() => {
    if (state.error && !state.isLoading) {
      const timer = setTimeout(() => {
        setShowRetryOptions(true)
      }, 3000)

      return () => clearTimeout(timer)
    } else {
      setShowRetryOptions(false)
    }
  }, [state.error, state.isLoading])

  const handleStartCardSave = () => {
    setShowRetryOptions(false)
    initCardSave()
  }

  const handleRefreshAndRetry = () => {
    setShowRetryOptions(false)
    initCardSave(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 relative">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={state.isLoading}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Добавление банковской карты
          </h2>
          <p className="text-gray-600 mb-6">
            Для сохранения карты будет произведена верификация на сумму 0 ₸
          </p>

          {/* Состояние загрузки */}
          {state.isLoading && (
            <div className="card-save-modal">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <div className="text-center">
                  <p className="text-gray-700 font-medium mb-1">
                    Инициализация платежной сессии...
                  </p>
                  {state.attemptCount > 0 && (
                    <p className="text-sm text-blue-600">
                      Попытка {state.attemptCount + 1} из 3
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Пожалуйста, не закрывайте это окно
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Состояние ошибки */}
          {state.error && !state.isLoading && (
            <div className="error-state">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.334 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Произошла ошибка
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {state.error}
                  </p>
                  
                  {!showRetryOptions && (
                    <p className="text-sm text-gray-500">
                      Варианты восстановления появятся через несколько секунд...
                    </p>
                  )}

                  {showRetryOptions && state.canRetry && (
                    <div className="retry-actions space-y-3">
                      <button 
                        onClick={handleStartCardSave}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all active:scale-95"
                      >
                        Попробовать снова
                      </button>
                      <button 
                        onClick={handleRefreshAndRetry}
                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all active:scale-95"
                      >
                        Обновить сессию и повторить
                      </button>
                      <button 
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-all"
                      >
                        Отменить
                      </button>
                    </div>
                  )}

                  {showRetryOptions && !state.canRetry && (
                    <button 
                      onClick={onClose}
                      className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-all"
                    >
                      Закрыть
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Начальное состояние */}
          {!state.isLoading && !state.error && (
            <div className="initial-state">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Готовы добавить карту?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ваши данные будут надежно защищены банком
                  </p>
                </div>

                <button 
                  onClick={handleStartCardSave}
                  className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Добавить карту
                </button>

                <p className="text-xs text-gray-500 text-center">
                  При нажатии откроется защищенная форма банка для ввода данных карты
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
