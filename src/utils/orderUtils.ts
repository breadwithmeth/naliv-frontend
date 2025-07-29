// Утилиты для работы с активными заказами

export const getOrderStatusIcon = (status: number): string => {
  switch (status) {
    case 0: return '💳' // Оплачен
    case 1: return '👨‍🍳' // Готовится
    case 2: return '🚚' // В доставке
    case 3: return '✅' // Доставлен
    case 4: return '❌' // Отменен
    case 5: return '⏳' // Ожидает оплаты
    default: return '📦'
  }
}

export const getOrderStatusColor = (status: number): string => {
  switch (status) {
    case 0: return '#4caf50' // Оплачен - зеленый
    case 1: return '#ff9800' // Готовится - оранжевый
    case 2: return '#2196f3' // В доставке - синий
    case 3: return '#4caf50' // Доставлен - зеленый
    case 4: return '#f44336' // Отменен - красный
    case 5: return '#ffc107' // Ожидает оплаты - желтый
    default: return '#9e9e9e' // Неизвестно - серый
  }
}

export const formatOrderTime = (timeString: string): string => {
  // Простое форматирование времени
  // В реальном приложении стоит использовать библиотеки типа date-fns или moment.js
  return timeString
}

export const getDeliveryTypeText = (type: 'DELIVERY' | 'PICKUP'): string => {
  return type === 'DELIVERY' ? 'Доставка' : 'Самовывоз'
}

export const formatPrice = (price: number): string => {
  return `${price.toLocaleString()} ₸`
}
