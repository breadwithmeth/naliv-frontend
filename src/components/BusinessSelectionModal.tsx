import { useState, useEffect, useCallback } from 'react'
import { useBusiness } from '../contexts/BusinessContext'
import { useCart } from '../contexts/CartContext'

interface BusinessApiResponse {
  success: boolean
  data: {
    businesses: Business[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      total_pages: number
    }
    filters: Record<string, unknown>
  }
  message: string
}

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

interface BusinessSelectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BusinessSelectionModal({ isOpen, onClose }: BusinessSelectionModalProps) {
  const { setSelectedBusiness, businesses, setBusinesses, loading, setLoading, selectedBusiness } = useBusiness()
  const { getTotalItems } = useCart()
  const [modalLoading, setModalLoading] = useState(false)

  const totalItems = getTotalItems()

  const fetchBusinesses = useCallback(async () => {
    try {
      setModalLoading(true)
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/businesses')
      const data: BusinessApiResponse = await response.json()
      
      if (data.success) {
        setBusinesses(data.data.businesses)
      }
    } catch (err) {
      console.error('Error fetching businesses:', err)
    } finally {
      setModalLoading(false)
      setLoading(false)
    }
  }, [setBusinesses, setLoading])

  useEffect(() => {
    if (isOpen && businesses.length === 0) {
      fetchBusinesses()
    }
  }, [isOpen, businesses.length, fetchBusinesses])

  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(business)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              📍 Выберите магазин
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Выберите магазин для просмотра товаров и цен
          </p>
          {selectedBusiness && totalItems > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600">⚠️</span>
                <span className="text-sm font-medium text-yellow-700">
                  При смене магазина корзина будет очищена
                </span>
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                В корзине: {totalItems} товар{totalItems === 1 ? '' : totalItems < 5 ? 'а' : 'ов'}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {modalLoading || loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Загружаем магазины...</p>
            </div>
          ) : businesses.length > 0 ? (
            <div className="grid gap-4">
              {businesses.map((business) => (
                <button
                  key={business.id}
                  onClick={() => handleBusinessSelect(business)}
                  className="text-left p-4 rounded-lg border hover:border-primary-300 hover:bg-primary-50 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                      🏪
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">
                        {business.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {business.city_name && `${business.city_name}, `}{business.address}
                      </p>
                      {business.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {business.description}
                        </p>
                      )}
                    </div>
                    <div className="text-primary-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏪</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Магазины не найдены
              </h3>
              <p className="text-gray-600">
                Не удалось загрузить список магазинов
              </p>
              <button
                onClick={fetchBusinesses}
                className="btn btn-primary mt-4"
              >
                Попробовать снова
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Магазин можно будет изменить в любой момент через верхнюю панель
          </p>
        </div>
      </div>
    </div>
  )
}
