import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
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

interface AddressesResponse {
  success: boolean
  data: {
    addresses: Address[]
  }
  message: string
}

interface AddressSelectorProps {
  businessId: number
  onAddressSelect: (address: Address) => void
  selectedAddressId?: number | null
  className?: string
  showDeliveryInfo?: boolean
  compact?: boolean
}

export default function AddressSelector({
  businessId,
  onAddressSelect,
  selectedAddressId,
  className = '',
  showDeliveryInfo = true,
  compact = false,
}: AddressSelectorProps) {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Функция для получения адресов с проверкой доставки
  const fetchAddressesForOrder = async (
    businessId: number,
    userToken: string
  ) => {
    try {
      setLoading(true)
      setError(null)

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AddressesResponse = await response.json()

      if (data.success) {
        // Фильтруем только те адреса, где доставка доступна
        const availableAddresses = data.data.addresses.filter(
          addr => addr.delivery?.available
        )
        setAddresses(availableAddresses)
        return availableAddresses
      } else {
        throw new Error(data.message || 'Не удалось загрузить адреса')
      }
    } catch (error) {
      console.error('Error fetching addresses for order:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Произошла ошибка при загрузке адресов'
      )
      setAddresses([])
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (businessId && user) {
      const token = localStorage.getItem('token')
      if (token) {
        fetchAddressesForOrder(businessId, token)
      }
    }
  }, [businessId, user])

  if (!user) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-sm text-gray-500">
          Войдите в аккаунт для просмотра адресов
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mb-2"></div>
        <p className="text-sm text-gray-600">
          Проверяем доставку по адресам...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      >
        <p className="text-sm text-red-600 mb-2">{error}</p>
        <button
          onClick={() => {
            const token = localStorage.getItem('token')
            if (token) {
              fetchAddressesForOrder(businessId, token)
            }
          }}
          className="text-sm text-red-700 hover:text-red-800 font-medium bg-red-100 px-3 py-1 rounded"
        >
          Повторить
        </button>
      </div>
    )
  }

  if (addresses.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          Нет доступных адресов для доставки
        </p>
        <p className="text-xs text-gray-500">
          Добавьте адрес в зоне доставки выбранного магазина
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {addresses.map(address => (
        <div
          key={address.address_id}
          className={`border rounded-lg ${compact ? 'p-3' : 'p-4'} cursor-pointer transition-all ${
            selectedAddressId === address.address_id
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onAddressSelect(address)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-medium text-gray-900 mb-1 ${compact ? 'text-sm' : ''}`}
              >
                {address.name}
              </h3>
              <p
                className={`text-gray-600 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}
              >
                {address.address}
              </p>

              {address.apartment && (
                <p
                  className={`text-gray-500 mb-2 ${compact ? 'text-xs' : 'text-xs'}`}
                >
                  Кв. {address.apartment}
                  {address.entrance && `, подъезд ${address.entrance}`}
                  {address.floor && `, этаж ${address.floor}`}
                </p>
              )}

              {showDeliveryInfo && address.delivery && (
                <div
                  className={`flex items-center space-x-4 ${compact ? 'text-xs' : 'text-xs'}`}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-green-600">✓</span>
                    <span className="text-green-600 font-medium">
                      Доставка доступна
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Стоимость:</span>
                    <span className="text-orange-600 font-medium">
                      {address.delivery.price === 0
                        ? 'Бесплатно'
                        : `${address.delivery.price} ₸`}
                    </span>
                  </div>
                  {address.delivery.distance && (
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Расстояние:</span>
                      <span className="text-gray-700">
                        {address.delivery.distance.toFixed(1)} км
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedAddressId === address.address_id && (
              <div className="ml-3">
                <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
