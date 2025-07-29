import { getDeliveryTypeText, formatPrice } from '../utils/orderUtils'
import { getStatusInfo, getStatusCssClass, getStatusIcon, getOrderProgress } from '../utils/statusUtils'

interface ActiveOrder {
  order_id: number
  order_uuid: string
  user_id: number
  business_id: number
  delivery_type: 'DELIVERY' | 'PICKUP' | null
  current_status: {
    status: number
    name: string
    color: string
    icon: string
    time_ago: string
  } | null
  business: {
    business_id: number
    name: string
    address: string
    logo?: string
  } | null
  user: {
    user_id: number
    name: string
    login: string
  } | null
  cost: {
    total: number
    delivery: number
    service_fee: number
  } | null
  items_count: number
  time_since_created: string
}

interface ActiveOrderCardProps {
  order: ActiveOrder
  className?: string
}

export default function ActiveOrderCard({ order, className = '' }: ActiveOrderCardProps) {
  // Проверяем, что все необходимые данные присутствуют
  if (!order || !order.current_status || !order.business) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-sm text-red-600">Ошибка загрузки данных заказа</p>
      </div>
    )
  }

  // Получаем информацию о статусе
  const statusInfo = getStatusInfo(order.current_status.status)
  const statusCssClass = getStatusCssClass(order.current_status.status)
  const statusIconPath = getStatusIcon(order.current_status.status)
  const orderProgress = getOrderProgress(order.current_status.status)

  // Временно делаем карточку без ссылки, пока API не готов
  const handleClick = () => {
    // Можно добавить модальное окно или другую логику
    console.log('Детали заказа:', order)
    alert(`Заказ #${order.order_id}\nСтатус: ${statusInfo.name}\nОписание: ${statusInfo.description}\nСумма: ${formatPrice(order.cost?.total || 0)}`)
  }

  return (
    <button
      onClick={handleClick}
      className={`block w-full text-left bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Прогресс-бар для активных заказов */}
      {statusInfo.isActive && orderProgress > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Прогресс заказа</span>
            <span>{orderProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="h-1.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ 
                width: `${orderProgress}%`,
                backgroundColor: statusInfo.color
              }}
            />
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-sm font-medium text-gray-900">
              Заказ #{order.order_id || 'N/A'}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusCssClass}`}>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusIconPath} />
                </svg>
                <span>{statusInfo.name}</span>
              </div>
            </span>
          </div>
          
          {/* Описание статуса */}
          <p className="text-xs text-gray-500 mb-2 italic">
            {statusInfo.description}
          </p>
          
          <p className="text-xs text-gray-600 mb-1">
            {order.business?.name || 'Магазин не указан'}
          </p>
          <p className="text-xs text-gray-500">
            {order.items_count || 0} товар(ов) • {order.time_since_created || 'Время неизвестно'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {formatPrice(order.cost?.total || 0)}
          </p>
          {(order.delivery_type || 'DELIVERY') === 'DELIVERY' && (order.cost?.delivery || 0) > 0 && (
            <p className="text-xs text-gray-500">
              +{formatPrice(order.cost?.delivery || 0)} доставка
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center text-xs text-gray-500">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d={(order.delivery_type || 'DELIVERY') === 'DELIVERY' 
                ? "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                : "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              } 
            />
          </svg>
          {getDeliveryTypeText(order.delivery_type || 'DELIVERY')}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {order.current_status?.time_ago || 'Время неизвестно'}
        </div>
      </div>
    </button>
  )
}
