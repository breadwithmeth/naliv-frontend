import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

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
  setSelectedAddressId: (addressId: number | null) => void
  getSelectedAddress: () => Address | null
  searchAddresses: (query: string) => Promise<{ success: boolean; data?: AddressSearchResult[]; message?: string }>
  addAddress: (addressLine: string, lat: number, lon: number, name?: string, apartment?: string, entrance?: string, floor?: string, other?: string) => Promise<{ success: boolean; message: string }>
  deleteAddress: (addressId: number) => Promise<{ success: boolean; message: string }>
  fetchAddresses: () => Promise<void>
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
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)
  
  // Загружаем выбранный адрес из localStorage
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(() => {
    const saved = localStorage.getItem('selectedAddressId')
    return saved ? parseInt(saved, 10) : null
  })

  const fetchAddresses = async () => {
    if (!isAuthenticated || !token) return

    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAddresses(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchAddresses = async (query: string): Promise<{ success: boolean; data?: AddressSearchResult[]; message?: string }> => {
    try {
      const response = await fetch(`http://localhost:3000/api/addresses/search?query=${encodeURIComponent(query)}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          return { success: true, data: data.data || [] }
        } else {
          return { success: false, message: data.message || 'Ошибка поиска адресов' }
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
          'Authorization': `Bearer ${token}`,
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
          other
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchAddresses() // Обновляем список адресов
        return { success: true, message: 'Адрес успешно добавлен' }
      } else {
        return { success: false, message: data.message || 'Ошибка добавления адреса' }
      }
    } catch (error) {
      console.error('Error adding address:', error)
      return { success: false, message: 'Ошибка соединения с сервером' }
    }
  }

  const deleteAddress = async (addressId: number): Promise<{ success: boolean; message: string }> => {
    if (!isAuthenticated || !token) {
      return { success: false, message: 'Необходима авторизация' }
    }

    try {
      const response = await fetch(`http://localhost:3000/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchAddresses() // Обновляем список адресов
        return { success: true, message: 'Адрес удален' }
      } else {
        return { success: false, message: data.message || 'Ошибка удаления адреса' }
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      return { success: false, message: 'Ошибка соединения с сервером' }
    }
  }

  // Загружаем адреса при авторизации
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses()
    } else {
      setAddresses([])
      setSelectedAddressId(null)
    }
  }, [isAuthenticated])

  // Автоматически выбираем первый адрес при загрузке
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].address_id)
    }
  }, [addresses, selectedAddressId])

  // Сохраняем выбранный адрес в localStorage
  useEffect(() => {
    if (selectedAddressId) {
      localStorage.setItem('selectedAddressId', selectedAddressId.toString())
    } else {
      localStorage.removeItem('selectedAddressId')
    }
  }, [selectedAddressId])

  const getSelectedAddress = (): Address | null => {
    if (!selectedAddressId) return null
    return addresses.find(address => address.address_id === selectedAddressId) || null
  }

  const value: AddressContextType = {
    addresses,
    loading,
    selectedAddressId,
    setSelectedAddressId,
    getSelectedAddress,
    searchAddresses,
    addAddress,
    deleteAddress,
    fetchAddresses
  }

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  )
}
