import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: Props) {
  const { sendCode, verifyCode } = useAuth()
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  // Очистка формы при закрытии
  const handleClose = () => {
    setStep('phone')
    setPhoneNumber('')
    setCode('')
    setError('')
    setCooldown(0)
    onClose()
  }

  // Форматирование номера телефона
  const formatPhoneNumber = (value: string) => {
    // Удаляем все кроме цифр
    const cleaned = value.replace(/\D/g, '')
    
    // Если начинается с 8, заменяем на 7
    if (cleaned.startsWith('8')) {
      return '+7' + cleaned.slice(1)
    }
    
    // Если начинается с 7, добавляем +
    if (cleaned.startsWith('7')) {
      return '+' + cleaned
    }
    
    // Если не начинается с 7, добавляем +7
    if (cleaned.length > 0) {
      return '+7' + cleaned
    }
    
    return value
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber || phoneNumber.length < 12) {
      setError('Введите корректный номер телефона')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await sendCode(phoneNumber)
      
      if (result.success) {
        setStep('code')
        // Запускаем обратный отсчет
        setCooldown(60)
        const timer = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Ошибка отправки кода')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code || code.length < 4) {
      setError('Введите код из SMS')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await verifyCode(phoneNumber, code)
      
      if (result.success) {
        onSuccess()
        handleClose()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Ошибка проверки кода')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (cooldown > 0) return
    
    setLoading(true)
    try {
      const result = await sendCode(phoneNumber)
      if (result.success) {
        setCooldown(60)
        const timer = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Ошибка отправки кода')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'phone' ? 'Вход в аккаунт' : 'Подтверждение'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  placeholder="+7 XXX XXX XX XX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !phoneNumber}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Отправляем...' : 'Получить код'}
              </button>

              <p className="text-sm text-gray-600 text-center">
                На ваш номер будет отправлен код для входа
              </p>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Код из SMS
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Отправлен на номер {phoneNumber}
                </p>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Введите код"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-lg tracking-widest"
                  disabled={loading}
                  maxLength={6}
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !code}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Проверяем...' : 'Войти'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ← Изменить номер
                </button>
                
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={cooldown > 0 || loading}
                  className="text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `Повторить через ${cooldown}с` : 'Отправить еще раз'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
