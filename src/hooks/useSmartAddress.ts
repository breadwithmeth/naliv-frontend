import { useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { createApiUrlWithParams } from '../utils/api'

export interface Address {
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

interface UseSmartAddressReturn {
  getAddressesForOrder: (businessId: number) => Promise<Address[]>
  validateAddressForDelivery: (
    addressId: number,
    businessId: number
  ) => Promise<Address | null>
}

/**
 * Хук для работы с адресами с проверкой доставки
 */
export const useSmartAddress = (): UseSmartAddressReturn => {
  const { user } = useAuth()

  // Получить адреса с проверкой доставки
  const getAddressesForOrder = useCallback(
    async (targetBusinessId: number): Promise<Address[]> => {
      if (!user) {
        console.warn('User not authenticated')
        return []
      }

      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('No auth token found')
        return []
      }

      try {
        const response = await fetch(
          createApiUrlWithParams('/api/addresses/user/with-delivery', {
            business_id: targetBusinessId,
          }),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          // Фильтруем только те адреса, где доставка доступна
          return (
            data.data.addresses.filter(
              (addr: Address) => addr.delivery?.available
            ) || []
          )
        } else {
          throw new Error(data.message || 'Не удалось загрузить адреса')
        }
      } catch (error) {
        console.error('Error fetching addresses for order:', error)
        return []
      }
    },
    [user]
  )

  // Проверить конкретный адрес для доставки
  const validateAddressForDelivery = useCallback(
    async (
      addressId: number,
      targetBusinessId: number
    ): Promise<Address | null> => {
      const addresses = await getAddressesForOrder(targetBusinessId)
      return addresses.find(addr => addr.address_id === addressId) || null
    },
    [getAddressesForOrder]
  )

  return {
    getAddressesForOrder,
    validateAddressForDelivery,
  }
}
