# 🛒 Выбор адреса для заказа - Новый рекомендуемый способ

## Обзор

Новый API для работы с адресами позволяет получать только те адреса пользователя, которые доступны для доставки от конкретного магазина. Это решает проблему показа недоступных адресов и улучшает пользовательский опыт.

## API Endpoint

```
GET /api/addresses/user/with-delivery?business_id={businessId}
```

### Параметры

- `business_id` (required) - ID магазина для проверки доставки

### Заголовки

```
Authorization: Bearer {userToken}
```

## Структура ответа

```typescript
interface Address {
  address_id: number
  name: string
  address: string
  apartment?: string
  entrance?: string
  floor?: string
  other?: string
  delivery?: {
    available: boolean
    price: number
    delivery_type: string
    distance: number
    zone_name: string
  }
}

interface ApiResponse {
  success: boolean
  data: {
    addresses: Address[]
  }
  message: string
}
```

## Базовая функция для получения адресов

```javascript
const getAddressesForOrder = async (businessId, userToken) => {
  const response = await fetch(
    `/api/addresses/user/with-delivery?business_id=${businessId}`,
    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  )
  const data = await response.json()

  // Фильтруем только те адреса, где доставка доступна
  return data.data.addresses.filter(addr => addr.delivery?.available)
}
```

## Компонент для отображения адресов

```jsx
const AddressSelector = ({ businessId, onAddressSelect }) => {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadAddresses = async () => {
      setLoading(true)
      try {
        const userToken = localStorage.getItem('token')
        if (userToken) {
          const result = await getAddressesForOrder(businessId, userToken)
          setAddresses(result)
        }
      } catch (error) {
        console.error('Ошибка загрузки адресов:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAddresses()
  }, [businessId])

  if (loading) {
    return <div>Загрузка адресов...</div>
  }

  return (
    <div>
      {addresses.map(address => (
        <div key={address.address_id} className="address-option">
          <h3>{address.name}</h3>
          <p>{address.address}</p>
          <p>Доставка: {address.delivery.price} тенге</p>
          <button onClick={() => onAddressSelect(address)}>
            Выбрать этот адрес
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Интеграция в проекте

### 1. Home.tsx

На главной странице добавлена кнопка для показа компонента выбора адресов:

```jsx
{
  user && selectedBusiness && !showAddressSelection && (
    <div className="mt-6">
      <button
        onClick={() => setShowAddressSelection(true)}
        className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 transition-colors"
      >
        📍 Выбрать адрес для доставки
      </button>
    </div>
  )
}
```

### 2. Checkout.tsx

В процессе оформления заказа пользователь может:

- Видеть выбранный адрес с информацией о доставке
- Изменить адрес, используя новый компонент выбора
- Добавить новый адрес через профиль

```jsx
{
  !showAddressSelection && selectedAddress ? (
    // Показываем выбранный адрес
    <AddressDisplay address={selectedAddress} />
  ) : (
    // Показываем компонент выбора адресов
    <AddressSelectionCard
      businessId={selectedBusiness.id}
      onAddressSelect={handleAddressSelect}
      selectedAddressId={selectedAddress?.address_id}
    />
  )
}
```

## Компоненты

### AddressSelectionCard

Новый компонент, который:

- Загружает адреса с проверкой доставки
- Отображает только доступные адреса
- Показывает стоимость и расстояние доставки
- Позволяет выбрать адрес

### AddressSelector (обновленный)

Обновленный компонент с дополнительными опциями:

- `showDeliveryInfo` - показывать ли информацию о доставке
- `compact` - компактный режим отображения

## Преимущества нового подхода

### ✅ Для пользователей:

- Видят только адреса, доступные для доставки
- Сразу видят стоимость доставки для каждого адреса
- Не тратят время на недоступные варианты
- Более понятный интерфейс

### ✅ Для разработчиков:

- Одинаковый API для всех компонентов
- Меньше запросов к серверу
- Простая интеграция
- Лучшая производительность

### ✅ Для бизнеса:

- Меньше отказов из-за недоступности доставки
- Более точная информация о зонах доставки
- Лучший пользовательский опыт

## Миграция со старого подхода

Если в проекте используется старый подход с получением всех адресов и последующей проверкой доставки, рекомендуется:

1. Заменить вызовы `/api/addresses/user` на `/api/addresses/user/with-delivery`
2. Добавить параметр `business_id`
3. Удалить дополнительные проверки доступности доставки
4. Обновить интерфейс для отображения информации о доставке

## Примеры использования

См. файлы:

- `src/components/AddressSelectionCard.tsx` - основной компонент
- `src/pages/Home.tsx` - интеграция на главной странице
- `src/pages/Checkout.tsx` - интеграция в процессе заказа
- `src/examples/AddressSelectionExample.tsx` - примеры кода
