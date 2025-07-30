// Пример использования нового API для выбора адреса для заказа

import { useState, useEffect } from 'react'
import { createApiUrlWithParams } from '../utils/api'

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

// 🛒 Выбор адреса для заказа (новый рекомендуемый способ)

/**
 * Получить адреса с проверкой доставки
 * @param businessId ID магазина
 * @param userToken Токен пользователя
 * @returns Массив адресов, доступных для доставки
 */
const getAddressesForOrder = async (
  businessId: number,
  userToken: string
): Promise<Address[]> => {
  const response = await fetch(
    createApiUrlWithParams('/api/addresses/user/with-delivery', {
      business_id: businessId,
    }),
    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  )

  const data = await response.json()

  // Фильтруем только те адреса, где доставка доступна
  return data.data.addresses.filter((addr: Address) => addr.delivery?.available)
}

/**
 * Компонент для отображения адресов с возможностью выбора
 */
export const AddressSelectionExample = ({
  businessId,
  onAddressSelect,
}: {
  businessId: number
  onAddressSelect: (address: Address) => void
}) => {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAddresses = async () => {
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

    fetchAddresses()
  }, [businessId])

  if (loading) {
    return <div>Загрузка адресов...</div>
  }

  return (
    <div>
      <h3>Выберите адрес доставки</h3>
      {addresses.map(address => (
        <div key={address.address_id} className="address-option">
          <h4>{address.name}</h4>
          <p>{address.address}</p>
          {address.delivery && (
            <p>
              Доставка:{' '}
              {address.delivery.price === 0
                ? 'Бесплатно'
                : `${address.delivery.price} тенге`}
            </p>
          )}
          <button onClick={() => onAddressSelect(address)}>
            Выбрать этот адрес
          </button>
        </div>
      ))}
    </div>
  )
}

// Пример использования в компоненте
export const OrderFormExample = () => {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [businessId] = useState(1) // ID выбранного магазина

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address)
    console.log('Выбран адрес:', address)

    // Здесь можно выполнить дополнительные действия:
    // - Пересчитать стоимость доставки
    // - Обновить итоговую сумму заказа
    // - Показать информацию о времени доставки
  }

  return (
    <div>
      <h2>Оформление заказа</h2>

      {selectedAddress ? (
        <div className="selected-address">
          <h3>Выбранный адрес:</h3>
          <p>
            <strong>{selectedAddress.name}</strong>
          </p>
          <p>{selectedAddress.address}</p>
          {selectedAddress.delivery && (
            <p>Стоимость доставки: {selectedAddress.delivery.price} ₸</p>
          )}
          <button onClick={() => setSelectedAddress(null)}>
            Изменить адрес
          </button>
        </div>
      ) : (
        <AddressSelectionExample
          businessId={businessId}
          onAddressSelect={handleAddressSelect}
        />
      )}
    </div>
  )
}

export default {
  getAddressesForOrder,
  AddressSelectionExample,
  OrderFormExample,
}
