// Утилиты для работы со статусами заказов

export interface OrderStatus {
  code: number
  name: string
  description: string
  color: string
  isActive: boolean
}

// Словарь статусов заказов
export const ORDER_STATUSES: Record<number, OrderStatus> = {
  66: {
    code: 66,
    name: 'Новый заказ',
    description: 'Заказ создан, ожидает оплаты',
    color: '#ffa500',
    isActive: true
  },
  0: {
    code: 0,
    name: 'Оплачен',
    description: 'Заказ оплачен, передан в обработку',
    color: '#4caf50',
    isActive: true
  },
  1: {
    code: 1,
    name: 'В обработке',
    description: 'Заказ принят в обработку',
    color: '#2196f3',
    isActive: true
  },
  2: {
    code: 2,
    name: 'Собран',
    description: 'Заказ собран, готов к доставке',
    color: '#9c27b0',
    isActive: true
  },
  3: {
    code: 3,
    name: 'Передан курьеру',
    description: 'Заказ передан курьеру',
    color: '#ff9800',
    isActive: true
  },
  4: {
    code: 4,
    name: 'В пути',
    description: 'Курьер направляется к клиенту',
    color: '#607d8b',
    isActive: true
  },
  5: {
    code: 5,
    name: 'Доставлен',
    description: 'Заказ доставлен',
    color: '#4caf50',
    isActive: false
  },
  99: {
    code: 99,
    name: 'Отменен',
    description: 'Заказ отменен',
    color: '#ff4444',
    isActive: false
  }
}

/**
 * Получить информацию о статусе по коду
 */
export function getStatusInfo(statusCode: number): OrderStatus {
  return ORDER_STATUSES[statusCode] || {
    code: statusCode,
    name: 'Неизвестный статус',
    description: 'Статус не определен',
    color: '#9e9e9e',
    isActive: true
  }
}

/**
 * Проверить, является ли заказ активным
 */
export function isOrderActive(statusCode: number): boolean {
  const status = ORDER_STATUSES[statusCode]
  return status ? status.isActive : true
}

/**
 * Получить CSS-класс для статуса
 */
export function getStatusCssClass(statusCode: number): string {
  // Возвращаем базовые CSS-классы в зависимости от статуса
  switch (statusCode) {
    case 66:
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 0:
      return 'bg-green-100 text-green-800 border-green-200'
    case 1:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 2:
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 3:
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 4:
      return 'bg-slate-100 text-slate-800 border-slate-200'
    case 5:
      return 'bg-green-100 text-green-800 border-green-200'
    case 99:
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Получить иконку для статуса (SVG path)
 */
export function getStatusIcon(statusCode: number): string {
  switch (statusCode) {
    case 66:
      // Новый заказ - иконка документа
      return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    case 0:
      // Оплачен - иконка галочки
      return 'M5 13l4 4L19 7'
    case 1:
      // В обработке - иконка шестеренки
      return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    case 2:
      // Собран - иконка коробки
      return 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
    case 3:
      // Передан курьеру - иконка пользователя с коробкой
      return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    case 4:
      // В пути - иконка грузовика
      return 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-6a2 2 0 00-2-2h-8v8z'
    case 5:
      // Доставлен - иконка дома с галочкой
      return 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    case 99:
      // Отменен - иконка крестика
      return 'M6 18L18 6M6 6l12 12'
    default:
      // Неизвестный статус - иконка вопроса
      return 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}

/**
 * Получить прогресс заказа в процентах
 */
export function getOrderProgress(statusCode: number): number {
  switch (statusCode) {
    case 66: return 10  // Новый заказ
    case 0: return 25   // Оплачен
    case 1: return 40   // В обработке
    case 2: return 60   // Собран
    case 3: return 75   // Передан курьеру
    case 4: return 90   // В пути
    case 5: return 100  // Доставлен
    case 99: return 0   // Отменен
    default: return 0
  }
}
