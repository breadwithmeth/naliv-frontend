import { useState, useEffect } from 'react'
import { useAddress } from '../contexts/AddressContext'

interface AddAddressModalProps {
  isOpen: boolean
  onClose: () => void
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

export default function AddAddressModal({ isOpen, onClose }: AddAddressModalProps) {
  const { searchAddresses, addAddress } = useAddress()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([])
  const [selectedAddress, setSelectedAddress] = useState<AddressSearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  // Дополнительные поля для адреса
  const [addressName, setAddressName] = useState('')
  const [apartment, setApartment] = useState('')
  const [entrance, setEntrance] = useState('')
  const [floor, setFloor] = useState('')
  const [other, setOther] = useState('')

  useEffect(() => {
    if (!isOpen) {
      // Сброс состояния при закрытии модала
      setSearchQuery('')
      setSearchResults([])
      setSelectedAddress(null)
      setShowResults(false)
      setAddressName('')
      setApartment('')
      setEntrance('')
      setFloor('')
      setOther('')
    }
  }, [isOpen])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setShowResults(true)
    
    try {
      // Добавляем "Казахстан" в начало поискового запроса
      const searchQueryWithCountry = `Казахстан ${searchQuery.trim()}`
      const result = await searchAddresses(searchQueryWithCountry)
      if (result.success && result.data) {
        setSearchResults(result.data)
      } else {
        setSearchResults([])
        alert(result.message || 'Ошибка поиска адресов')
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
      alert('Произошла ошибка при поиске')
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleSelectAddress = (address: AddressSearchResult) => {
    setSelectedAddress(address)
    setSearchQuery(address.name)
    setShowResults(false)
  }

  const handleAdd = async () => {
    if (!selectedAddress) {
      alert('Выберите адрес из результатов поиска')
      return
    }

    if (!addressName.trim()) {
      alert('Введите название адреса')
      return
    }

    setIsAdding(true)
    
    try {
      const result = await addAddress(
        selectedAddress.name,
        selectedAddress.point.lat,
        selectedAddress.point.lon,
        addressName.trim(),
        apartment.trim(),
        entrance.trim(),
        floor.trim(),
        other.trim()
      )
      
      if (result.success) {
        onClose()
      } else {
        alert(result.message || 'Ошибка добавления адреса')
      }
    } catch (error) {
      console.error('Add address error:', error)
      alert('Произошла ошибка при добавлении адреса')
    } finally {
      setIsAdding(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-material-lg shadow-material-lg w-full max-w-md material-elevation-4">
        {/* Заголовок */}
        <div className="p-6 border-b border-surface-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-surface-900">
              Добавить адрес
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Основной контент */}
        <div className="p-6">
          {/* Поиск адреса */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-surface-700 mb-3">
              Найти адрес
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Введите город и адрес (Казахстан добавляется автоматически)"
                className="flex-1 input-material"
                disabled={isSearching || isAdding}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || isAdding || !searchQuery.trim()}
                className="btn btn-primary px-6"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Найти'
                )}
              </button>
            </div>
          </div>

          {/* Результаты поиска */}
          {showResults && (
            <div className="mb-6">
              {isSearching ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <p className="mt-3 text-sm text-surface-600">Поиск адресов...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-3">
                    Выберите адрес из найденных:
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-surface-200 rounded-material">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectAddress(result)}
                        className={`w-full text-left p-4 hover:bg-surface-50 border-b border-surface-100 last:border-b-0 transition-colors ${
                          selectedAddress?.name === result.name ? 'bg-primary-50 border-primary-200' : ''
                        }`}
                      >
                        <div className="font-medium text-sm text-surface-900 mb-1">
                          {result.name}
                        </div>
                        <div className="text-xs text-surface-600 mb-1">
                          {result.description}
                        </div>
                        <div className="text-xs text-surface-400">
                          {result.point.lat.toFixed(6)}, {result.point.lon.toFixed(6)} • {result.kind}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-surface-500">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm font-medium mb-1">Адреса не найдены</p>
                  <p className="text-xs text-surface-400">
                    Попробуйте изменить запрос
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Выбранный адрес */}
          {selectedAddress && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-material">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 mb-1">
                    Выбранный адрес:
                  </p>
                  <p className="text-sm text-green-800 font-medium mb-1">
                    {selectedAddress.name}
                  </p>
                  <p className="text-xs text-green-700 mb-1">
                    {selectedAddress.description}
                  </p>
                  <p className="text-xs text-green-600">
                    Координаты: {selectedAddress.point.lat.toFixed(6)}, {selectedAddress.point.lon.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Дополнительная информация об адресе */}
          {selectedAddress && (
            <div className="space-y-4 mb-6">
              {/* Название адреса */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Название адреса *
                </label>
                <input
                  type="text"
                  value={addressName}
                  onChange={(e) => setAddressName(e.target.value)}
                  placeholder="Дом, Работа, и т.д."
                  className="w-full input-material"
                  disabled={isAdding}
                />
              </div>

              {/* Дополнительные поля */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Квартира
                  </label>
                  <input
                    type="text"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    placeholder="25"
                    className="w-full input-material"
                    disabled={isAdding}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Подъезд
                  </label>
                  <input
                    type="text"
                    value={entrance}
                    onChange={(e) => setEntrance(e.target.value)}
                    placeholder="2"
                    className="w-full input-material"
                    disabled={isAdding}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Этаж
                  </label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="5"
                    className="w-full input-material"
                    disabled={isAdding}
                  />
                </div>
              </div>

              {/* Дополнительная информация */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Дополнительная информация
                </label>
                <textarea
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  placeholder="Код домофона, особые указания и т.д."
                  rows={3}
                  className="w-full input-material resize-none"
                  disabled={isAdding}
                />
              </div>
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="p-6 border-t border-surface-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={isAdding}
            className="flex-1 btn btn-secondary"
          >
            Отмена
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedAddress || !addressName.trim() || isAdding}
            className="flex-1 btn btn-primary"
          >
            {isAdding ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Добавление...
              </div>
            ) : (
              'Добавить адрес'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
