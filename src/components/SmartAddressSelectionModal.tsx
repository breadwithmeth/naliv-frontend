import { Link } from 'react-router-dom'
import { useAddress } from '../contexts/AddressContext'
import { useAuth } from '../contexts/AuthContext'
import { useBusiness } from '../contexts/BusinessContext'
import AddressSelector from './AddressSelector'

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

interface SmartAddressSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddressSelect?: (address: Address) => void
}

export default function SmartAddressSelectionModal({
  isOpen,
  onClose,
  onAddressSelect,
}: SmartAddressSelectionModalProps) {
  const { setSelectedAddressId, selectedAddressId } = useAddress()
  const { user } = useAuth()
  const { selectedBusiness } = useBusiness()

  const handleAddressSelect = (address: Address) => {
    setSelectedAddressId(address.address_id)

    if (onAddressSelect) {
      onAddressSelect(address)
    }

    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            📍 Выберите адрес доставки
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {!user ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Вход в аккаунт</h3>
              <p className="text-gray-600 mb-4">
                Войдите в аккаунт, чтобы управлять адресами доставки
              </p>
              <Link
                to="/profile"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Войти в аккаунт
              </Link>
            </div>
          ) : !selectedBusiness ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                Выберите магазин
              </h3>
              <p className="text-gray-600 mb-4">
                Сначала выберите магазин, чтобы проверить доступность доставки
              </p>
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Выбрать магазин
              </button>
            </div>
          ) : (
            <>
              {/* Информация о выбранном магазине */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-orange-900">
                      Доставка из магазина
                    </h4>
                    <p className="text-sm text-orange-700 truncate">
                      {selectedBusiness.name}
                    </p>
                    <p className="text-xs text-orange-600 truncate">
                      {selectedBusiness.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Умный селектор адресов */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Доступные адреса для доставки
                </h4>
                <AddressSelector
                  businessId={selectedBusiness.id}
                  onAddressSelect={handleAddressSelect}
                  selectedAddressId={selectedAddressId}
                />
              </div>

              {/* Кнопка добавления нового адреса */}
              <div className="border-t border-gray-200 pt-4">
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-600">
                    Добавить новый адрес
                  </span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
