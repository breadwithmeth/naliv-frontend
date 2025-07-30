import { useAuth } from '../contexts/AuthContext'
import { useBusiness } from '../contexts/BusinessContext'

export default function TokenInfo() {
  const { user, token } = useAuth()
  const { selectedBusiness } = useBusiness()

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token)
      alert('Токен скопирован в буфер обмена!')
    }
  }

  const testNewAPI = async () => {
    if (!token || !selectedBusiness) {
      alert('Нужен токен и выбранный магазин')
      return
    }

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

      const data = await response.json()
      console.log('API Response:', data)

      if (response.ok) {
        alert(`Успех! Получено ${data.data?.addresses?.length || 0} адресов`)
      } else {
        alert(`Ошибка: ${data.error?.message || data.message}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert(`Ошибка сети: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold mb-4">Информация о токене</h1>

        <div className="space-y-4">
          <div>
            <strong>Пользователь:</strong> {user ? user.name : 'Не авторизован'}
          </div>

          <div>
            <strong>Магазин:</strong>{' '}
            {selectedBusiness
              ? `${selectedBusiness.name} (ID: ${selectedBusiness.id})`
              : 'Не выбран'}
          </div>

          <div>
            <strong>Токен есть:</strong> {token ? 'Да' : 'Нет'}
          </div>

          {token && (
            <div>
              <strong>Токен:</strong>
              <div className="mt-2">
                <textarea
                  className="w-full p-2 border rounded text-xs font-mono"
                  rows={4}
                  readOnly
                  value={token}
                />
                <button
                  onClick={copyToken}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Копировать токен
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={testNewAPI}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              disabled={!token || !selectedBusiness}
            >
              Тестировать новый API с доставкой
            </button>

            <div className="text-sm text-gray-600">
              <strong>Curl команда для терминала:</strong>
              {token && selectedBusiness && (
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                  {`curl -X GET "http://localhost:3000/api/addresses/user/with-delivery?business_id=${selectedBusiness.id}" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json"`}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
