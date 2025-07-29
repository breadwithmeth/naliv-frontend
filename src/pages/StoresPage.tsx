import { useState, useEffect, useCallback } from 'react'
import { useBusiness } from '../contexts/BusinessContext'
import { createApiUrl } from '../utils/api'

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

export default function Stores() {
  const [stores, setStores] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setSelectedBusiness, selectedBusiness } = useBusiness()

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(createApiUrl('/api/businesses'))

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: BusinessApiResponse = await response.json()

      if (data.success) {
        setStores(data.data.businesses)
      } else {
        throw new Error(data.message || 'Не удалось загрузить магазины')
      }
    } catch (err) {
      console.error('Error fetching stores:', err)
      setError(
        err instanceof Error ? err.message : 'Не удалось загрузить магазины'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const handleStoreSelect = (store: Business) => {
    setSelectedBusiness(store)
    alert(`Магазин "${store.name}" выбран`)
  }

  const isSelected = (storeId: number) => {
    return selectedBusiness?.id === storeId
  }

  const formatAddress = (store: Business) => {
    const parts = []
    if (store.city_name) {
      parts.push(store.city_name)
    }
    if (store.address) {
      parts.push(store.address)
    }
    return parts.join(', ')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button onClick={() => window.history.back()} className="mr-3">
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-lg font-medium flex-1">Наши магазины</h1>
        <button
          onClick={fetchStores}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          title="Обновить список"
        >
          <svg
            className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 animate-pulse"
                >
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={fetchStores}
              className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-1">Магазины не найдены</p>
          </div>
        ) : (
          stores.map(store => (
            <div
              key={store.id}
              className={`bg-white rounded-lg p-4 border-2 transition-all ${
                isSelected(store.id)
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-transparent hover:border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">{store.name}</h3>
                    {isSelected(store.id) && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                        Выбран
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {formatAddress(store)}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleStoreSelect(store)}
                  disabled={isSelected(store.id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelected(store.id)
                      ? 'bg-orange-200 text-orange-700 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {isSelected(store.id) ? 'Выбран' : 'Выбрать магазин'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="h-20"></div>
    </div>
  )
}
