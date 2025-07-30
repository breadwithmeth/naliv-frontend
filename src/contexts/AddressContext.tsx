import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { useBusiness } from './BusinessContext'
import { createApiUrl, createApiUrlWithParams } from '../utils/api'

interface DeliveryInfo {
  available: boolean
  price: number
  min_time: number
  max_time: number
}

interface Address {
  address_id: number
  user_id: number
  name: string
  address: string
  lat: number
  lon: number
  apartment?: string
  entrance?: string
  floor?: string
  other?: string
  city_id?: number | null
  log_timestamp: string
  isDeleted: number
  delivery?: DeliveryInfo
}

interface AddressSearchResult {
  name: string
  point: {
    lat: number
    lon: number
  }
  description: string
  kind: string
  precision: string
}

interface AddressContextType {
  addresses: Address[]
  loading: boolean
  selectedAddressId: number | null
  selectedAddress: Address | null
  setSelectedAddressId: (addressId: number | null) => Promise<void>
  getSelectedAddress: () => Address | null
  fetchSelectedAddress: (businessId: number) => Promise<Address | null>
  searchAddresses: (
    query: string
  ) => Promise<{
    success: boolean
    data?: AddressSearchResult[]
    message?: string
  }>
  addAddress: (
    addressLine: string,
    lat: number,
    lon: number,
    name?: string,
    apartment?: string,
    entrance?: string,
    floor?: string,
    other?: string
  ) => Promise<{ success: boolean; message: string }>
  deleteAddress: (
    addressId: number
  ) => Promise<{ success: boolean; message: string }>
  fetchAddressesWithDelivery: (businessId: number) => Promise<Address[]>
  getAddressesForOrder: () => Address[]
}

const AddressContext = createContext<AddressContextType | undefined>(undefined)

export function useAddress() {
  const context = useContext(AddressContext)
  if (context === undefined) {
    throw new Error('useAddress must be used within an AddressProvider')
  }
  return context
}

interface AddressProviderProps {
  children: ReactNode
}

export function AddressProvider({ children }: AddressProviderProps) {
  const { token, isAuthenticated } = useAuth()
  const { selectedBusiness } = useBusiness()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)

  // Выбранный адрес теперь загружается с бэкенда
  const [selectedAddressIdState, setSelectedAddressIdState] = useState<
    number | null
  >(null)

  // Обернутая функция для установки выбранного адреса
  const setSelectedAddressId = useCallback(
    async (addressId: number | null) => {
      console.log('AddressContext: Setting selectedAddressId to:', addressId)
      console.log(
        'AddressContext: Current addresses:',
        addresses.map(addr => ({ id: addr.address_id, name: addr.name }))
      )

      // Обновляем локальное состояние сразу для быстрого отклика UI
      setSelectedAddressIdState(addressId)

      // Если addressId не null, сохраняем выбор на бэкенде
      if (addressId && isAuthenticated && token) {
        try {
          console.log(
            'AddressContext: Saving selected address to backend:',
            addressId
          )
          const response = await fetch(
            createApiUrl('/api/addresses/user/select'),
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                address_id: addressId,
              }),
            }
          )

          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              console.log(
                'AddressContext: Address selection saved successfully:',
                data.data
              )
            } else {
              console.error(
                'AddressContext: Failed to save address selection:',
                data.message
              )
            }
          } else {
            console.error(
              'AddressContext: Failed to save address selection, status:',
              response.status
            )
          }
        } catch (error) {
          console.error('AddressContext: Error saving selected address:', error)
        }
      }
    },
    [addresses, isAuthenticated, token]
  )

  const fetchAddressesWithDelivery = useCallback(
    async (businessId: number): Promise<Address[]> => {
      console.log('AddressContext: fetchAddressesWithDelivery called:', {
        businessId,
        isAuthenticated,
        hasToken: !!token,
      })
      if (!isAuthenticated || !token) {
        console.log(
          'AddressContext: Not authenticated or no token, skipping fetch'
        )
        return []
      }

      try {
        setLoading(true)
        console.log(
          'AddressContext: Fetching addresses with delivery info from API...'
        )
        const response = await fetch(
          createApiUrlWithParams('/api/addresses/user/with-delivery', {
            business_id: businessId,
          }),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        console.log('AddressContext: API response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('AddressContext: API response data:', data)
          if (data.success) {
            const addressesData = data.data?.addresses || []
            const validAddresses = Array.isArray(addressesData)
              ? addressesData
              : []
            console.log(
              'AddressContext: Fetched addresses with delivery:',
              validAddresses.length,
              'addresses'
            )

            // Обновляем состояние с новыми адресами
            setAddresses(validAddresses)
            return validAddresses
          } else {
            console.log('AddressContext: API returned error:', data.message)
            setAddresses([])
            return []
          }
        } else {
          console.log(
            'AddressContext: API request failed with status:',
            response.status
          )
          setAddresses([])
          return []
        }
      } catch (error) {
        console.error(
          'AddressContext: Error fetching addresses with delivery:',
          error
        )
        setAddresses([])
        return []
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, token]
  )

  const fetchSelectedAddress = useCallback(
    async (businessId: number): Promise<Address | null> => {
      console.log('AddressContext: fetchSelectedAddress called:', {
        businessId,
        isAuthenticated,
        hasToken: !!token,
      })
      if (!isAuthenticated || !token) {
        console.log(
          'AddressContext: Not authenticated or no token, skipping fetch'
        )
        return null
      }

      try {
        console.log('AddressContext: Fetching selected address from API...')
        const response = await fetch(
          createApiUrl('/api/addresses/user/selected'),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        console.log(
          'AddressContext: Selected address API response status:',
          response.status
        )
        if (response.ok) {
          const data = await response.json()
          console.log(
            'AddressContext: Selected address API response data:',
            data
          )
          if (data.success && data.data?.selected_address) {
            const selectedAddr = data.data.selected_address
            console.log(
              'AddressContext: Fetched selected address:',
              selectedAddr.address_id
            )

            // Обновляем выбранный адрес
            setSelectedAddressIdState(selectedAddr.address_id)

            return selectedAddr
          } else {
            console.log('AddressContext: No selected address found')
            setSelectedAddressIdState(null)
            return null
          }
        } else if (response.status === 404) {
          console.log('AddressContext: No selected address (404)')
          setSelectedAddressIdState(null)
          return null
        } else {
          console.log(
            'AddressContext: API request failed with status:',
            response.status
          )
          return null
        }
      } catch (error) {
        console.error('AddressContext: Error fetching selected address:', error)
        return null
      }
    },
    [isAuthenticated, token]
  )

  const getAddressesForOrder = useCallback((): Address[] => {
    // Возвращаем только те адреса, где доставка доступна
    return addresses.filter(addr => addr.delivery?.available === true)
  }, [addresses])

  const searchAddresses = async (
    query: string
  ): Promise<{
    success: boolean
    data?: AddressSearchResult[]
    message?: string
  }> => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/addresses/search?query=${encodeURIComponent(query)}`
      )

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          return { success: true, data: data.data || [] }
        } else {
          return {
            success: false,
            message: data.message || 'Ошибка поиска адресов',
          }
        }
      } else {
        return { success: false, message: 'Ошибка поиска адресов' }
      }
    } catch (error) {
      console.error('Error searching addresses:', error)
      return { success: false, message: 'Произошла ошибка при поиске' }
    }
  }

  const addAddress = async (
    addressLine: string,
    lat: number,
    lon: number,
    name: string = 'Новый адрес',
    apartment: string = '',
    entrance: string = '',
    floor: string = '',
    other: string = ''
  ): Promise<{ success: boolean; message: string }> => {
    if (!isAuthenticated || !token) {
      return { success: false, message: 'Необходима авторизация' }
    }

    try {
      const response = await fetch('http://localhost:3000/api/addresses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          address: addressLine,
          lat,
          lon,
          apartment,
          entrance,
          floor,
          other,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Вместо fetchAddresses используем fetchAddressesWithDelivery если есть выбранный бизнес
        if (selectedBusiness) {
          await fetchAddressesWithDelivery(selectedBusiness.id)
        }
        return { success: true, message: 'Адрес успешно добавлен' }
      } else {
        return {
          success: false,
          message: data.message || 'Ошибка добавления адреса',
        }
      }
    } catch (error) {
      console.error('Error adding address:', error)
      return { success: false, message: 'Ошибка соединения с сервером' }
    }
  }

  const deleteAddress = async (
    addressId: number
  ): Promise<{ success: boolean; message: string }> => {
    if (!isAuthenticated || !token) {
      return { success: false, message: 'Необходима авторизация' }
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/addresses/${addressId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()

      if (data.success) {
        // Вместо fetchAddresses используем fetchAddressesWithDelivery если есть выбранный бизнес
        if (selectedBusiness) {
          await fetchAddressesWithDelivery(selectedBusiness.id)
        }
        return { success: true, message: 'Адрес удален' }
      } else {
        return {
          success: false,
          message: data.message || 'Ошибка удаления адреса',
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      return { success: false, message: 'Ошибка соединения с сервером' }
    }
  }

  // Загружаем адреса при авторизации
  useEffect(() => {
    if (isAuthenticated) {
      if (selectedBusiness) {
        // Сначала загружаем выбранный адрес с бэкенда
        console.log(
          'AddressContext: Loading selected address and addresses for business:',
          selectedBusiness.id
        )
        Promise.all([
          fetchSelectedAddress(selectedBusiness.id),
          fetchAddressesWithDelivery(selectedBusiness.id),
        ])
          .then(() => {
            console.log(
              'AddressContext: Loaded selected address and all addresses'
            )
          })
          .catch(error => {
            console.error('AddressContext: Error loading addresses:', error)
          })
      } else {
        // Очищаем адреса если нет выбранного бизнеса
        console.log('AddressContext: No business selected, clearing addresses')
        setAddresses([])
        setSelectedAddressIdState(null)
      }
    } else {
      setAddresses([])
      setSelectedAddressId(null).catch(error => {
        console.error('AddressContext: Error clearing selected address:', error)
      })
    }
  }, [
    isAuthenticated,
    selectedBusiness,
    fetchSelectedAddress,
    fetchAddressesWithDelivery,
    setSelectedAddressId,
  ])

  // Автоматически выбираем первый адрес при загрузке
  useEffect(() => {
    console.log('AddressContext: Auto-select effect triggered:', {
      addressesLength: addresses.length,
      selectedAddressIdState,
      firstAddressId: addresses.length > 0 ? addresses[0].address_id : null,
    })

    if (addresses.length > 0 && !selectedAddressIdState) {
      console.log(
        'AddressContext: Auto-selecting first address:',
        addresses[0].address_id
      )
      setSelectedAddressId(addresses[0].address_id).catch(error => {
        console.error('AddressContext: Error auto-selecting address:', error)
      })
    }
    // Проверяем, существует ли выбранный адрес в списке адресов
    if (selectedAddressIdState && addresses.length > 0) {
      const addressExists = addresses.find(
        addr => addr.address_id === selectedAddressIdState
      )
      if (!addressExists) {
        console.log(
          'AddressContext: Selected address not found, switching to first:',
          addresses[0].address_id
        )
        setSelectedAddressId(addresses[0].address_id).catch(error => {
          console.error(
            'AddressContext: Error switching to first address:',
            error
          )
        })
      }
    }
  }, [addresses, selectedAddressIdState, setSelectedAddressId])

  const getSelectedAddress = useCallback((): Address | null => {
    if (!selectedAddressIdState || !Array.isArray(addresses)) return null
    return (
      addresses.find(
        address => address.address_id === selectedAddressIdState
      ) || null
    )
  }, [selectedAddressIdState, addresses])

  const selectedAddress = useMemo(() => {
    console.log('AddressContext: Computing selectedAddress:', {
      selectedAddressIdState,
      addressesLength: addresses.length,
      addressIds: addresses.map(addr => addr.address_id),
    })

    const result =
      selectedAddressIdState && Array.isArray(addresses)
        ? addresses.find(
            address => address.address_id === selectedAddressIdState
          ) || null
        : null

    console.log('AddressContext: selectedAddress computed:', {
      selectedAddressIdState,
      addressesLength: addresses.length,
      result: result ? { id: result.address_id, name: result.name } : null,
    })
    return result
  }, [selectedAddressIdState, addresses])

  const value: AddressContextType = {
    addresses: Array.isArray(addresses) ? addresses : [],
    loading,
    selectedAddressId: selectedAddressIdState,
    selectedAddress,
    setSelectedAddressId,
    getSelectedAddress,
    fetchSelectedAddress,
    searchAddresses,
    addAddress,
    deleteAddress,
    fetchAddressesWithDelivery,
    getAddressesForOrder,
  }

  return (
    <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
  )
}
