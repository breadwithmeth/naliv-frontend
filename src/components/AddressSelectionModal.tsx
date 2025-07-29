import { Link } from 'react-router-dom'
import { useAddress } from '../contexts/AddressContext'
import { useAuth } from '../contexts/AuthContext'

interface AddressSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddressSelect?: (addressId: number) => void
}

export default function AddressSelectionModal({ isOpen, onClose, onAddressSelect }: AddressSelectionModalProps) {
  const { addresses, loading, selectedAddressId, setSelectedAddressId } = useAddress()
  const { user } = useAuth()

  const handleAddressSelect = (addressId: number) => {
    setSelectedAddressId(addressId)
    if (onAddressSelect) {
      onAddressSelect(addressId)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              📍 Выберите адрес доставки
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
            Выберите адрес из сохраненных или добавьте новый
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {!user ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">👤</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Необходима авторизация
              </h3>
              <p className="text-gray-600 mb-6">
                Войдите в аккаунт, чтобы сохранять и выбирать адреса доставки
              </p>
              <Link
                to="/profile"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Войти в аккаунт
              </Link>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Загружаем адреса...</p>
            </div>
          ) : addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((address) => {
                const isSelected = selectedAddressId === address.address_id
                return (
                  <button
                    key={address.address_id}
                    onClick={() => handleAddressSelect(address.address_id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all group ${
                      isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-green-600">📍</span>
                          <h3 className={`font-medium group-hover:text-green-700 ${
                            isSelected ? 'text-green-700' : 'text-gray-900'
                          }`}>
                            {address.name}
                          </h3>
                          {isSelected && (
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                              Выбран
                            </span>
                          )}
                        </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        {address.address}
                        {address.apartment && `, кв. ${address.apartment}`}
                        {address.entrance && `, подъезд ${address.entrance}`}
                        {address.floor && `, этаж ${address.floor}`}
                      </p>
                      
                      {address.other && (
                        <p className="text-xs text-gray-500">
                          {address.other}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
                )
              })}
              
              {/* Add New Address Button */}
              <Link
                to="/profile"
                onClick={onClose}
                className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all group"
              >
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                    Добавить новый адрес
                  </span>
                </div>
              </Link>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📍</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Нет сохраненных адресов
              </h3>
              <p className="text-gray-600 mb-6">
                Добавьте адрес доставки, чтобы было удобнее оформлять заказы
              </p>
              <Link
                to="/profile"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Добавить адрес
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
