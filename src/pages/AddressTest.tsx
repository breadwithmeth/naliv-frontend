import { useAddress } from '../contexts/AddressContext'
import { useBusiness } from '../contexts/BusinessContext'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import SmartAddressSelectionModal from '../components/SmartAddressSelectionModal'

export default function AddressTest() {
  const {
    addresses,
    selectedAddress,
    selectedAddressId,
    setSelectedAddressId,
    fetchAddressesWithDelivery,
    getAddressesForOrder,
    loading,
  } = useAddress()
  const { selectedBusiness } = useBusiness()
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Принудительно загружаем адреса при монтировании компонента
  useEffect(() => {
    // fetchAddresses удален - адреса загружаются автоматически через AddressContext
    console.log(
      'AddressTest: Addresses are loaded automatically via AddressContext'
    )
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold mb-4">Тест выбора адреса</h1>

        <div className="space-y-4">
          <div>
            <strong>Пользователь:</strong> {user ? user.name : 'Не авторизован'}
          </div>

          <div>
            <strong>Токен:</strong>{' '}
            {localStorage.getItem('token') ? 'Есть' : 'Отсутствует'}
          </div>

          <div>
            <strong>Магазин:</strong>{' '}
            {selectedBusiness ? selectedBusiness.name : 'Не выбран'}
          </div>

          <div>
            <strong>Загрузка:</strong> {loading ? 'Да' : 'Нет'}
          </div>

          <div>
            <strong>Выбранный адрес ID:</strong>{' '}
            {selectedAddressId || 'Не выбран'}
          </div>

          <div>
            <strong>Выбранный адрес:</strong>{' '}
            {selectedAddress ? selectedAddress.name : 'Не выбран'}
          </div>

          <div>
            <strong>Всего адресов:</strong> {addresses.length}
          </div>

          <div>
            <strong>Адреса с доставкой:</strong> {getAddressesForOrder().length}
          </div>

          <div>
            <strong>LocalStorage:</strong>{' '}
            {localStorage.getItem('selectedAddressId') || 'Пусто'}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => {
              console.log('AddressTest: fetchAddresses is disabled')
            }}
            className="w-full bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
            disabled={true}
          >
            Старый API отключен
          </button>

          <button
            onClick={() => {
              if (selectedBusiness) {
                console.log(
                  'AddressTest: Fetch addresses with delivery for business:',
                  selectedBusiness.id
                )
                fetchAddressesWithDelivery(selectedBusiness.id)
              } else {
                alert('Сначала выберите магазин')
              }
            }}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
            disabled={loading || !selectedBusiness}
          >
            {loading
              ? 'Загрузка...'
              : 'Обновить адреса (новый API с доставкой)'}
          </button>

          <button
            onClick={async () => {
              const token = localStorage.getItem('token')
              console.log(
                'Testing API with token:',
                token ? 'Token exists' : 'No token'
              )

              try {
                const response = await fetch(
                  'http://localhost:3000/api/addresses',
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                )

                console.log('API Response status:', response.status)
                const data = await response.json()
                console.log('API Response data:', data)

                if (response.ok) {
                  alert(`API Success: ${data.data?.length || 0} addresses`)
                } else {
                  alert(
                    `API Error: ${response.status} - ${data.message || 'Unknown error'}`
                  )
                }
              } catch (error) {
                console.error('API Error:', error)
                alert(
                  `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`
                )
              }
            }}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600"
          >
            Тест старого API запроса
          </button>

          <button
            onClick={async () => {
              if (!selectedBusiness) {
                alert('Сначала выберите магазин')
                return
              }

              const token = localStorage.getItem('token')
              console.log(
                'Testing new delivery API with token:',
                token ? 'Token exists' : 'No token'
              )
              console.log('Business ID:', selectedBusiness.id)

              try {
                const response = await fetch(
                  `http://localhost:3000/api/addresses/user/with-delivery?business_id=${selectedBusiness.id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                )

                console.log('New API Response status:', response.status)
                const data = await response.json()
                console.log('New API Response data:', data)

                if (response.ok) {
                  const addressesWithDelivery = data.data?.addresses || []
                  const availableAddresses = addressesWithDelivery.filter(
                    (addr: { delivery?: { available: boolean } }) =>
                      addr.delivery?.available
                  )
                  alert(
                    `New API Success: ${addressesWithDelivery.length} total addresses, ${availableAddresses.length} with delivery`
                  )
                } else {
                  alert(
                    `New API Error: ${response.status} - ${data.message || 'Unknown error'}`
                  )
                }
              } catch (error) {
                console.error('New API Error:', error)
                alert(
                  `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`
                )
              }
            }}
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
            disabled={!selectedBusiness}
          >
            Тест нового API с доставкой
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Открыть выбор адреса
          </button>

          {addresses.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Быстрый выбор:</h3>
              {addresses.slice(0, 3).map(addr => (
                <button
                  key={addr.address_id}
                  onClick={() => setSelectedAddressId(addr.address_id)}
                  className={`w-full mb-2 p-2 text-left rounded border ${
                    selectedAddressId === addr.address_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{addr.name}</div>
                  <div className="text-sm text-gray-600">{addr.address}</div>
                  {addr.delivery && (
                    <div className="text-xs mt-1">
                      <span
                        className={`inline-block px-2 py-1 rounded ${
                          addr.delivery.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {addr.delivery.available
                          ? `Доставка: ${addr.delivery.price} тенге`
                          : 'Доставка недоступна'}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setSelectedAddressId(null)}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Сбросить выбор
          </button>
        </div>
      </div>

      <SmartAddressSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddressSelect={address => {
          console.log('Test: Address selected from modal:', address)
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}
