import { useAddress } from '../contexts/AddressContext'

export default function AddressDebug() {
  const {
    addresses,
    selectedAddress,
    selectedAddressId,
    setSelectedAddressId,
  } = useAddress()

  const handleTestSave = () => {
    const testId = addresses.length > 0 ? addresses[0].address_id : 999
    console.log('AddressDebug: Setting test address ID:', testId)
    setSelectedAddressId(testId)

    // Проверяем localStorage сразу после установки
    setTimeout(() => {
      const saved = localStorage.getItem('selectedAddressId')
      console.log('AddressDebug: localStorage check result:', saved)
      alert(`Saved to localStorage: ${saved}`)
    }, 100)
  }

  const checkLocalStorage = () => {
    const saved = localStorage.getItem('selectedAddressId')
    console.log('AddressDebug: Current localStorage:', saved)
    alert(`Current localStorage value: ${saved}`)
  }

  const testManualSelection = () => {
    if (addresses.length > 1) {
      const nextAddress = addresses.find(
        addr => addr.address_id !== selectedAddressId
      )
      if (nextAddress) {
        console.log(
          'AddressDebug: Manually selecting address:',
          nextAddress.address_id,
          nextAddress.name
        )
        setSelectedAddressId(nextAddress.address_id)
      }
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="font-bold mb-2">Address Debug</h3>
      <p className="text-sm mb-1">Selected ID: {selectedAddressId}</p>
      <p className="text-sm mb-1">Addresses count: {addresses.length}</p>
      <p className="text-sm mb-2">
        Selected: {selectedAddress?.name || 'None'}
      </p>

      <div className="space-y-1">
        <button
          onClick={handleTestSave}
          className="w-full text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          Test Save
        </button>
        <button
          onClick={checkLocalStorage}
          className="w-full text-xs bg-green-500 text-white px-2 py-1 rounded"
        >
          Check Storage
        </button>
        <button
          onClick={testManualSelection}
          className="w-full text-xs bg-purple-500 text-white px-2 py-1 rounded"
        >
          Test Select
        </button>
      </div>

      {addresses.length > 0 && (
        <div className="mt-2 text-xs">
          <p className="font-semibold">Available addresses:</p>
          {addresses.slice(0, 3).map(addr => (
            <div
              key={addr.address_id}
              className={`cursor-pointer p-1 rounded ${
                selectedAddressId === addr.address_id
                  ? 'bg-blue-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                console.log(
                  'AddressDebug: Clicking address:',
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
