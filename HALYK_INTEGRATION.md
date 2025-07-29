# Улучшенная интеграция сохранения карт Halyk Bank

## Обзор

Реализована полноценная система сохранения банковских карт с интеграцией Halyk Bank, включающая:
- Автоматическое восстановление при ошибках
- Детальную обработку различных типов ошибок
- Улучшенный пользовательский интерфейс
- Страницы успеха и ошибок
- Автоматическое обновление списка карт

## Структура компонентов

### 1. `useCardSaving` Hook (`src/hooks/useCardSaving.ts`)

Основной хук для работы с сохранением карт:

```typescript
const { state, initCardSave, reset } = useCardSaving()
```

**Возможности:**
- Динамическая загрузка JS-библиотеки Halyk Bank
- Автоматическое восстановление при timeout (до 3 попыток)
- Обработка различных типов ошибок
- Интеграция с API endpoints для refresh токенов

### 2. `AddCardModal` компонент (`src/components/AddCardModal.tsx`)

Модальное окно с улучшенным UX:

```typescript
<AddCardModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={() => handleCardAdded()}
/>
```

**Особенности:**
- Индикация номера попытки (1/2/3)
- Отложенное появление кнопок повтора (через 3 сек)
- Разные варианты восстановления (обычный повтор / обновление сессии)
- Блокировка закрытия во время процесса

### 3. Страницы результатов

#### `CardSuccess` (`src/pages/CardSuccess.tsx`)
- Обратный отсчет с автоматическим переходом
- Список преимуществ сохраненной карты
- Информация о безопасности PCI DSS
- Ссылки на управление картами

#### `CardFailure` (`src/pages/CardFailure.tsx`)
- Маппинг кодов ошибок на понятные сообщения
- Рекомендации по решению проблем
- Кнопки для повтора или обращения в поддержку
- Альтернативные способы оплаты

## API интеграция

### Основные endpoints:

```typescript
// Инициализация сохранения карты
POST /api/payments/save-card/init
Body: {
  backLink: string,
  failureBackLink: string,
  postLink: string,
  userId: number
}

// Обновление токена при истечении
POST /api/payments/save-card/refresh-init
Body: { /* те же параметры */ }

// Проверка статуса и обработка ошибок
POST /api/payments/status
Body: {
  invoiceId: string,
  error?: string,
  errorMessage?: string
}
```

### Ответы API:

```typescript
// Успешная инициализация
{
  success: true,
  data: {
    paymentObject: HalykPaymentObject,
    jsLibraryUrl: string
  }
}

// Обработка ошибок
{
  success: true,
  data: {
    status: 'error',
    userMessage: string,
    recommendation: 'refresh_token' | 'retry' | 'user_cancelled',
    canRetry: boolean
  }
}
```

## Обработка ошибок

### Типы ошибок:

1. **timeout** - Автоматический refresh токена и повтор
2. **cancelled** - Пользователь отменил операцию
3. **card_error** - Проблемы с данными карты
4. **unknown** - Неизвестная ошибка

### Маппинг ошибок:

```typescript
const ERROR_MAPPING = {
  'timeout': {
    userMessage: 'Время оплаты истекло. Попробуйте еще раз.',
    recommendation: 'Проверьте интернет-соединение и повторите попытку',
    canRetry: true
  },
  'insufficient_funds': {
    userMessage: 'Недостаточно средств на карте.',
    recommendation: 'Пополните баланс карты или используйте другую карту',
    canRetry: true
  }
  // ... другие типы ошибок
}
```

## Жизненный цикл добавления карты

1. **Инициализация** (`initCardSave()`)
   - Запрос к `/api/payments/save-card/init`
   - Загрузка JS-библиотеки Halyk
   - Настройка callback'ов

2. **Обработка платежа** (Halyk виджет)
   - `halyk.showPaymentWidget(paymentObject, callback)`
   - Обработка success/error/cancel/timeout

3. **Обработка результата**
   - Успех → localStorage + custom event + перезагрузка карт
   - Ошибка → анализ типа + рекомендации + автовосстановление

4. **Финализация**
   - Переход на success/failure страницы
   - Автоматический возврат в checkout
   - Обновление UI с новыми картами

## Использование в Checkout

```typescript
// В компоненте Checkout.tsx уже интегрировано:

// Обработка возврата после добавления карты
useEffect(() => {
  const cardAdded = localStorage.getItem('cardAdded')
  
  if (cardAdded === 'success') {
    if (isAuthenticated && selectedPaymentMethod === 'card') {
      loadCards() // Перезагружаем список карт
    }
    localStorage.removeItem('cardAdded')
    alert('Карта успешно добавлена!')
  } else if (cardAdded === 'failure') {
    localStorage.removeItem('cardAdded')
    alert('Не удалось добавить карту. Попробуйте еще раз.')
  }
}, [isAuthenticated, selectedPaymentMethod, loadCards])
```

## Настройка роутинга

В `App.tsx` добавлены маршруты:

```typescript
<Route path="/cards/success" element={<CardSuccess />} />
<Route path="/cards/failure" element={<CardFailure />} />
```

## Безопасность

- Данные карт обрабатываются только на стороне Halyk Bank
- Токены имеют ограниченное время жизни
- Автоматическое обновление токенов при истечении
- Валидация всех входящих данных
- Логирование для отладки и мониторинга

## Настройка переменных окружения

1. Скопируйте файл с примером переменных окружения:
   ```bash
   cp .env.example .env
   ```

2. Настройте переменные в `.env`:
   ```
   VITE_API_URL=http://localhost:3000
   ```

3. Для production среды:
   ```
   VITE_API_URL=https://api.naliv.kz
   ```

## Развертывание

1. Убедитесь, что backend API поддерживает новые endpoints
2. Настройте переменные окружения (см. секцию выше)
3. Запустите сборку: `npm run build`
4. Проверьте работу в тестовой среде с тестовыми картами Halyk

## Мониторинг и отладка

- Все действия логируются в консоль браузера
- Коды ошибок сохраняются для технической поддержки
- localStorage используется для синхронизации между вкладками
- Custom events для обновления UI в реальном времени

## Тестирование

Используйте тестовые данные Halyk Bank:
- Тестовые карты из документации epayment.kz
- Проверьте все сценарии: успех, отмена, timeout, ошибки карты
- Убедитесь в корректной работе автовосстановления
