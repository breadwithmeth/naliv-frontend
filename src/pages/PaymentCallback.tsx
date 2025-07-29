import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'success' | 'failure'>('processing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Получаем параметры из URL
    const result = searchParams.get('result')
    const orderId = searchParams.get('order_id')
    const paymentId = searchParams.get('payment_id')

    console.log('Payment callback params:', { result, orderId, paymentId })

    // Обрабатываем результат
    if (result === 'success') {
      setStatus('success')
      setMessage('Оплата прошла успешно!')
      
      // Перенаправляем на страницу успеха через 3 секунды
      setTimeout(() => {
        navigate('/payment-success')
      }, 3000)
    } else if (result === 'failure' || result === 'cancel') {
      setStatus('failure')
      setMessage(result === 'cancel' ? 'Оплата была отменена' : 'Ошибка при оплате')
      
      // Перенаправляем обратно к выбору способа оплаты через 5 секунд
      setTimeout(() => {
        if (orderId) {
          navigate(`/order-payment/${orderId}`)
        } else {
          navigate('/unpaid-orders')
        }
      }, 5000)
    } else {
      setStatus('failure')
      setMessage('Неизвестный результат оплаты')
      
      setTimeout(() => {
        navigate('/unpaid-orders')
      }, 5000)
    }
  }, [searchParams, navigate])

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-12">
        {status === 'processing' && (
          <>
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              Обрабатываем результат оплаты...
            </h1>
            <p className="text-gray-600">
              Пожалуйста, подождите, мы проверяем статус вашего платежа
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              Оплата успешна!
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <p className="text-gray-500 text-sm">
              Перенаправляем на страницу успеха...
            </p>
          </>
        )}

        {status === 'failure' && (
          <>
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">❌</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              Проблема с оплатой
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <p className="text-gray-500 text-sm">
              Возвращаем к выбору способа оплаты...
            </p>
          </>
        )}
      </div>
    </div>
  )
}
