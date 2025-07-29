# API Configuration Migration

## Изменения

Все хардкодные URL `http://localhost:3000` были заменены на использование переменной окружения `VITE_API_URL`.

## Новые файлы

### `src/utils/api.ts`

Утилита для работы с API URL. Предоставляет следующие функции:

- `getApiUrl()` - получить базовый URL API
- `createApiUrl(endpoint)` - создать полный URL для эндпоинта
- `createApiUrlWithParams(endpoint, params)` - создать URL с query параметрами

## Обновленные файлы

- `src/components/PaymentModal.tsx`
- `src/components/BusinessSelectionModal.tsx`
- `src/pages/Home.tsx`
- `src/pages/Category.tsx`
- `src/pages/Catalog.tsx`
- `src/pages/Item.tsx`
- `src/pages/Profile.tsx`
- `src/pages/Checkout.tsx`
- `src/pages/UnpaidOrders.tsx`
- `src/pages/OrderPayment.tsx`
- `src/pages/OrderDetails.tsx`
- `src/contexts/AuthContext.tsx`
- `src/hooks/useCardSaving.ts`

## Настройка

### Для разработки (локально)

```env
VITE_API_URL=http://localhost:3000
```

### Для продакшена

```env
VITE_API_URL=https://api.naliv.kz
```

## Использование

```typescript
import { createApiUrl, createApiUrlWithParams } from '../utils/api'

// Простой URL
const response = await fetch(createApiUrl('/api/users'))

// URL с параметрами
const response = await fetch(
  createApiUrlWithParams('/api/users', {
    page: 1,
    limit: 20,
    search: 'test',
  })
)
```

## Преимущества

1. **Гибкость** - легко менять API URL для разных сред
2. **Безопасность** - нет хардкода в коде
3. **Централизация** - вся логика работы с URL в одном месте
4. **Удобство** - автоматическое формирование query параметров

## Migration Complete ✅

Все компоненты теперь используют переменные окружения для API URL.
