import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'

interface Business {
  id: number
  name: string
  description: string
  address: string
  lat: number
  lon: number
  logo: string
  img: string
  city_id: number
  city_name: string
  enabled: number
  created_at: string
}

interface BusinessContextType {
  selectedBusiness: Business | null
  setSelectedBusiness: (business: Business | null) => void
  businesses: Business[]
  setBusinesses: (businesses: Business[]) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  onBusinessChange?: () => void
  setOnBusinessChange: (callback: () => void) => void
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [selectedBusiness, setSelectedBusinessState] = useState<Business | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [onBusinessChange, setOnBusinessChangeState] = useState<(() => void) | undefined>(undefined)

  const setOnBusinessChange = useCallback((callback: () => void) => {
    console.log('setOnBusinessChange вызван')
    setOnBusinessChangeState(() => callback)
  }, [])

  // Загружаем выбранный магазин из localStorage при инициализации
  useEffect(() => {
    const savedBusiness = localStorage.getItem('selectedBusiness')
    if (savedBusiness) {
      try {
        const business = JSON.parse(savedBusiness)
        console.log('Загружаем магазин из localStorage:', business)
        setSelectedBusinessState(business)
      } catch (err) {
        console.error('Error parsing saved business:', err)
      }
    } else {
      console.log('Нет сохраненного магазина в localStorage')
    }
  }, [])

  // Функция для установки выбранного магазина с сохранением в localStorage
  const setSelectedBusiness = useCallback((business: Business | null) => {
    setSelectedBusinessState(prevBusiness => {
      console.log('Смена магазина:', {
        from: prevBusiness?.name || 'нет выбранного',
        to: business?.name || 'нет выбранного',
        previousId: prevBusiness?.id,
        newId: business?.id,
        sameId: prevBusiness?.id === business?.id
      })
      
      // Если это тот же магазин, не делаем ничего
      if (prevBusiness && business && prevBusiness.id === business.id) {
        console.log('Тот же магазин, пропускаем обновление')
        return prevBusiness
      }
      
      if (business) {
        localStorage.setItem('selectedBusiness', JSON.stringify(business))
      } else {
        localStorage.removeItem('selectedBusiness')
      }

      // Если магазин действительно изменился, вызываем callback для очистки корзины
      if (prevBusiness && business && prevBusiness.id !== business.id && onBusinessChange) {
        console.log('Обнаружена смена магазина, но очистка корзины временно отключена')
        // Временно отключено для отладки
        // setTimeout(() => {
        //   onBusinessChange()
        // }, 0)
      }
      
      return business
    })
  }, [onBusinessChange])

  const value = useMemo(() => ({
    selectedBusiness,
    setSelectedBusiness,
    businesses,
    setBusinesses,
    loading,
    setLoading,
    onBusinessChange,
    setOnBusinessChange
  }), [selectedBusiness, setSelectedBusiness, businesses, setBusinesses, loading, setLoading, onBusinessChange, setOnBusinessChange])

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return context
}
