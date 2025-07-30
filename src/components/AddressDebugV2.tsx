import { useAddress } from '../contexts/AddressContext'
import { useBusiness } from '../contexts/BusinessContext'

export default function AddressDebugV2() {
  const {
    addresses,
    selectedAddress,
    selectedAddressId,
    setSelectedAddressId,
  } = useAddress()
  const { selectedBusiness } = useBusiness()

  console.log('AddressDebugV2: Current state:', {
    addressesLength: addresses.length,
    selectedAddressId,
    selectedAddress: selectedAddress
      ? { id: selectedAddress.address_id, name: selectedAddress.name }
      : null,
    businessId: selectedBusiness?.id,
    localStorage: localStorage.getItem('selectedAddressId'),
  })

  const handleTestSelection = () => {
    if (addresses.length > 0) {
      const firstAddress = addresses[0]
      console.log(
        'AddressDebugV2: Testing selection of:',
        firstAddress.address_id,
        firstAddress.name
      )
      setSelectedAddressId(firstAddress.address_id)

      // Проверяем через небольшую задержку
      setTimeout(() => {
        console.log('AddressDebugV2: After selection:', {
          selectedAddressId,
          selectedAddress: selectedAddress
            ? { id: selectedAddress.address_id, name: selectedAddress.name }
            : null,
          localStorage: localStorage.getItem('selectedAddressId'),
        })
      }, 100)
    }
  }

  const handleClearSelection = () => {
    console.log('AddressDebugV2: Clearing selection')
    setSelectedAddressId(null)
  }

  if (!selectedBusiness) {
    return (
      <div className="fixed bottom-4 left-4 bg-yellow-100 p-4 rounded-lg shadow-lg border max-w-sm z-50">
        <h3 className="font-bold mb-2 text-yellow-800">Address Debug V2</h3>
        <p className="text-sm text-yellow-700">Выберите магазин сначала</p>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="font-bold mb-2">Address Debug V2</h3>
      <div className="text-xs space-y-1 mb-3">
        <div>Addresses: {addresses.length}</div>
        <div>Selected ID: {selectedAddressId || 'none'}</div>
        <div>Selected Name: {selectedAddress?.name || 'none'}</div>
        <div>Business: {selectedBusiness.name}</div>
        <div>
          LocalStorage: {localStorage.getItem('selectedAddressId') || 'none'}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleTestSelection}
          className="w-full text-xs bg-blue-500 text-white px-2 py-1 rounded"
          disabled={addresses.length === 0}
        >
          Test Select First
        </button>
        <button
          onClick={handleClearSelection}
          className="w-full text-xs bg-red-500 text-white px-2 py-1 rounded"
        >
          Clear Selection
        </button>
      </div>

      {addresses.length > 0 && (
        <div className="mt-2 text-xs">
          <div className="font-semibold">Available addresses:</div>
          {addresses.slice(0, 2).map(addr => (
            <div
              key={addr.address_id}
              className={`cursor-pointer p-1 rounded text-xs ${
                selectedAddressId === addr.address_id
                  ? 'bg-blue-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                console.log(
                  'AddressDebugV2: Clicking address:',
                  addr.address_id,
                  addr.name
                )
                setSelectedAddressId(addr.address_id)
              }}
            >
              {addr.address_id}: {addr.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
