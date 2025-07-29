import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { createApiUrl, getApiUrl } from '../utils/api'

interface CardSavingState {
  isLoading: boolean
  error: string | null
  canRetry: boolean
  attemptCount: number
  currentInvoiceId: string | null
}

interface UseCardSavingReturn {
  state: CardSavingState
  initCardSave: (isRefresh?: boolean) => Promise<void>
  handlePaymentError: (error: string, errorMessage: string) => Promise<void>
  reset: () => void
}

export const useCardSaving = (): UseCardSavingReturn => {
  const { user } = useAuth()
  const [state, setState] = useState<CardSavingState>({
    isLoading: false,
    error: null,
    canRetry: true,
    attemptCount: 0,
    currentInvoiceId: null
  })

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      canRetry: true,
      attemptCount: 0,
      currentInvoiceId: null
    })
  }, [])

  const handlePaymentError = useCallback(async (error: string, errorMessage: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token || !state.currentInvoiceId) {
        setState(prev => ({
          ...prev,
          error: errorMessage || 'Произошла ошибка при обработке платежа',
          isLoading: false,
          canRetry: true
        }))
        return
      }

      const response = await fetch(createApiUrl('/api/payments/status'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceId: state.currentInvoiceId,
          error,
          errorMessage
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const statusData = await response.json()
      
      if (statusData.success) {
        const { userMessage, recommendation, canRetry } = statusData.data
        
        setState(prev => ({
          ...prev,
          error: userMessage,
          canRetry,
          isLoading: false
        }))

        // Автоматическое восстановление для timeout
        if (recommendation === 'refresh_token' && state.attemptCount < 3) {
          console.log('Auto-retrying with token refresh...')
          setTimeout(() => {
            initCardSave(true) // Обновляем токен
          }, 2000)
        }
      } else {
        setState(prev => ({
          ...prev,
          error: statusData.message || 'Ошибка при проверке статуса платежа',
          isLoading: false,
          canRetry: true
        }))
      }
    } catch (err) {
      console.error('Error handling payment error:', err)
      setState(prev => ({
        ...prev,
        error: 'Произошла неизвестная ошибка',
        isLoading: false,
        canRetry: true
      }))
    }
  }, [state.currentInvoiceId, state.attemptCount])

  const initCardSave = useCallback(async (isRefresh = false) => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'Пользователь не авторизован' }))
      return
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        attemptCount: isRefresh ? prev.attemptCount + 1 : 0
      }))
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Токен авторизации не найден')
      }

      const endpoint = isRefresh 
        ? createApiUrl('/api/payments/save-card/refresh-init')
        : createApiUrl('/api/payments/save-card/init')
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          backLink: `${window.location.origin}/cards/success`,
          failureBackLink: `${window.location.origin}/cards/failure`,
          postLink: `${getApiUrl()}/api/payments/save-card/postlink`,
          userId: user.user_id
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Теперь API возвращает HTML страницу
      const htmlContent = await response.text()
      
      // Создаем новое окно для отображения HTML страницы Halyk Bank
      const paymentWindow = window.open('', 'halykPayment', 'width=800,height=600,scrollbars=yes,resizable=yes')
      
      if (!paymentWindow) {
        throw new Error('Не удалось открыть окно платежа. Проверьте настройки блокировщика всплывающих окон.')
      }

      // Записываем HTML содержимое в новое окно
      paymentWindow.document.write(htmlContent)
      paymentWindow.document.close()

      // Устанавливаем обработчик закрытия окна
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkClosed)
          
          // Проверяем результат в localStorage
          const cardAdded = localStorage.getItem('cardAdded')
          
          if (cardAdded === 'success') {
            console.log('Card added successfully')
            
            // Уведомляем об успехе
            window.dispatchEvent(new CustomEvent('cardAdded', { 
              detail: { success: true } 
            }))
            
            setState(prev => ({ ...prev, isLoading: false }))
          } else if (cardAdded === 'failure') {
            console.log('Card addition failed')
            setState(prev => ({ 
              ...prev, 
              isLoading: false, 
              error: 'Не удалось добавить карту',
              canRetry: true 
            }))
          } else {
            // Окно закрыто без результата - возможно отменено пользователем
            console.log('Payment window closed without result')
            setState(prev => ({ 
              ...prev, 
              isLoading: false, 
              error: 'Добавление карты отменено',
              canRetry: true 
            }))
          }
        }
      }, 1000) // Проверяем каждую секунду
      
    } catch (error) {
      console.error('Error initializing card save:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Произошла неизвестная ошибка',
        attemptCount: prev.attemptCount + 1 
      }))
    }
  }, [user])

  return { 
    state, 
    initCardSave, 
    handlePaymentError, 
    reset 
  }
}


