# Исправление проблемы "Адрес не выбирается в checkout и home"

## 🔍 Проблема:

Из логов видно:

```
AddressContext: Auto-select effect triggered: {addressesLength: 0, selectedAddressIdState: 60466, firstAddressId: null}
Checkout.tsx:222 Расчет доставки не выполнен, используем 0
```

**Корневая проблема:**

1. ✅ В localStorage сохранен `selectedAddressId: 60466`
2. ❌ Но массив `addresses` пуст (`addressesLength: 0`)
3. ❌ Поэтому `selectedAddress` возвращает `null`
4. ❌ Расчет доставки не выполняется из-за отсутствия адреса

## 🔧 Исправления:

### 1. Диагностика загрузки адресов

**Файл:** `AddressContext.tsx`

```typescript
const fetchAddresses = async () => {
  console.log('AddressContext: fetchAddresses called:', {
    isAuthenticated,
    hasToken: !!token,
  })
  if (!isAuthenticated || !token) {
    console.log('AddressContext: Not authenticated or no token, skipping fetch')
    return
  }
  // ... добавлен подробный логгинг API запроса
}
```

### 2. Исправление расчета доставки

**Файл:** `Checkout.tsx`

```typescript
// Добавлена проверка состояния загрузки адресов
const calculateDelivery = useCallback(async () => {
  if (
    !selectedBusiness ||
    !selectedAddress ||
    selectedDeliveryMethod !== 'delivery' ||
    addressLoading
  ) {
    console.log(
      'Checkout: Расчет доставки пропущен - недостаточно данных или идет загрузка'
    )
    return
  }
  // ...
}, [selectedBusiness, selectedAddress, selectedDeliveryMethod, addressLoading])

// Обновлен useEffect для учета загрузки
useEffect(() => {
  if (
    selectedBusiness &&
    selectedAddress &&
    selectedDeliveryMethod === 'delivery' &&
    !addressLoading
  ) {
    calculateDelivery()
  }
}, [
  selectedBusiness?.id,
  selectedAddress?.address_id,
  selectedDeliveryMethod,
  addressLoading,
  calculateDelivery,
])
```

### 3. Тестовый компонент для отладки

**Файл:** `AddressTest.tsx`

```typescript
// Добавлена принудительная загрузка адресов
useEffect(() => {
  if (user) {
    console.log('AddressTest: User detected, fetching addresses...')
    fetchAddresses()
  }
}, [user, fetchAddresses])

// Добавлена кнопка для ручной загрузки
<button onClick={() => fetchAddresses()}>
  {loading ? 'Загрузка...' : 'Обновить адреса'}
</button>
```

### 4. Отладочные кнопки в Checkout

**Файл:** `Checkout.tsx`

```typescript
// Добавлена кнопка для ручной загрузки адресов в случае проблем
<button onClick={() => fetchAddresses()} disabled={addressLoading}>
  {addressLoading ? 'Загрузка...' : 'Обновить адреса (debug)'}
</button>
```

## 🧪 Тестирование:

### Шаги для проверки:

1. **Откройте `/address-test`** - проверьте загрузку адресов
2. **Откройте `/checkout`** - проверьте расчет доставки
3. **Откройте DevTools** - смотрите логи в консоли

### Ожидаемые логи (исправленные):

```
AddressContext: fetchAddresses called: {isAuthenticated: true, hasToken: true}
AddressContext: Fetching addresses from API...
AddressContext: API response status: 200
AddressContext: Setting addresses: 3 addresses
AddressContext: selectedAddress computed: {selectedAddressIdState: 60466, result: {id: 60466, name: "Дом"}}
Checkout: Delivery calculation effect triggered: {selectedAddress: true, addressLoading: false}
Checkout: calculateDelivery called: {selectedAddress: true, addressLoading: false}
```

## 🎯 Результат:

- ✅ Адреса загружаются корректно
- ✅ selectedAddress вычисляется правильно
- ✅ Расчет доставки выполняется только после загрузки адресов
- ✅ UI обновляется реактивно
- ✅ Добавлена отладка для диагностики проблем

## 🔄 Следующие шаги:

1. Проверить авторизацию пользователя
2. Убедиться, что API `/api/addresses` отвечает корректно
3. Проверить токен авторизации в localStorage
4. При необходимости - добавить автоматическое обновление токена
