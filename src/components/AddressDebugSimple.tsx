import { useAddress } from '../contexts/AddressContext'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'

export default function AddressDebugSimple() {
  const {
    addresses,
    selectedAddress,
    selectedAddressId,
    setSelectedAddressId,
  } = useAddress()
  const { user } = useAuth()

  useEffect(() => {
    // Удален вызов fetchAddresses - адреса загружаются в AddressContext через fetchAddressesWithDelivery
    console.log(
      'AddressDebugSimple: Addresses are loaded automatically via AddressContext'
    )
  }, [user, addresses.length])

  console.log('AddressDebugSimple render:', {
    addressesCount: addresses.length,
    selectedAddressId,
    selectedAddressName: selectedAddress?.name,
    localStorage: localStorage.getItem('selectedAddressId'),
  })

  if (!user) {
    return (
      <div className="fixed bottom-20 right-4 bg-red-100 p-3 rounded shadow-lg max-w-xs">
        <h4 className="font-bold text-red-800">Address Debug</h4>
        <p className="text-red-600 text-sm">User not logged in</p>
      </div>
    )
  }

  return (
    <div className="fixed bottom-20 right-4 bg-white p-3 rounded shadow-lg max-w-xs border">
      <h4 className="font-bold mb-2">Address Debug</h4>
      <div className="text-xs space-y-1">
        <div>Addresses: {addresses.length}</div>
        <div>Selected ID: {selectedAddressId || 'none'}</div>
        <div>Selected: {selectedAddress?.name || 'none'}</div>
        <div>
          LocalStorage: {localStorage.getItem('selectedAddressId') || 'none'}
        </div>
      </div>

      {addresses.length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="text-xs font-semibold">Quick test:</div>
          {addresses.slice(0, 2).map(addr => (
            <button
              key={addr.address_id}
              onClick={() => {
                console.log('AddressDebugSimple: Selecting:', addr.address_id)
                setSelectedAddressId(addr.address_id)
              }}
              className={`w-full text-left text-xs p-1 rounded ${
                selectedAddressId === addr.address_id
                  ? 'bg-blue-100 border border-blue-300'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {addr.address_id}: {addr.name}
            </button>
          ))}
          <button
            onClick={() => {
              console.log('AddressDebugSimple: Clearing selection')
              setSelectedAddressId(null)
            }}
            className="w-full text-xs p-1 bg-red-100 hover:bg-red-200 rounded"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
