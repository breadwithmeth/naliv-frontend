import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useAddress } from '../contexts/AddressContext'
import { useBusiness } from '../contexts/BusinessContext'
import { Link } from 'react-router-dom'
import AddAddressModal from '../components/AddAddressModal'
import AddCardModal from '../components/AddCardModal'
import { createApiUrl } from '../utils/api'

interface Card {
  card_id: number
  mask: string
}

interface CardsResponse {
  success: boolean
  data: {
    cards: Card[]
    total: number
  }
  message: string
}

export default function Profile() {
  const { user, logout } = useAuth()
  const { addresses } = useAddress()
  const { businesses } = useBusiness()
  const [activeTab, setActiveTab] = useState('Данные')
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false)
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
  const [cards, setCards] = useState<Card[]>([])
  const [isLoadingCards, setIsLoadingCards] = useState(false)
  const [cardActionLoading, setCardActionLoading] = useState<number | null>(null)

  const tabs = ['Данные', 'Заказы', 'Избранное']

  // Функция для загрузки сохраненных карт
  const loadCards = async () => {
    if (!user) {
      setCards([])
      return
    }

    try {
      setIsLoadingCards(true)
      const response = await fetch(createApiUrl('/api/user/cards'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CardsResponse = await response.json()
      
      if (data.success) {
        setCards(data.data.cards)
      }
    } catch (error) {
      console.error('Error loading cards:', error)
    } finally {
      setIsLoadingCards(false)
    }
  }

  // Функция для удаления карты
  const deleteCard = async (cardId: number) => {
    try {
      setCardActionLoading(cardId)
      const response = await fetch(createApiUrl(`/api/user/cards/${cardId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setCards(cards.filter(card => card.card_id !== cardId))
      }
    } catch (error) {
      console.error('Error deleting card:', error)
    } finally {
      setCardActionLoading(null)
    }
  }

  useEffect(() => {
    loadCards()
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-lg font-medium">Профиль</h1>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Войдите в аккаунт
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Для просмотра профиля, сохранения адресов и отслеживания заказов
          </p>
          <Link 
            to="/auth"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Войти в аккаунт
          </Link>
        </div>

        {/* Bottom padding for navigation */}
        <div className="h-20"></div>
      </div>
    )
  }

  const handleCardAdded = () => {
    setIsAddCardModalOpen(false)
    loadCards()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button 
          onClick={() => window.history.back()}
          className="mr-3"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-medium flex-1">Профиль</h1>
        <button className="p-1">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === tab
                  ? 'text-orange-500 border-orange-500'
                  : 'text-gray-500 border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="px-4 py-4 space-y-4">
        {activeTab === 'Данные' && (
          <>
            {/* Bonus Section */}
            <div className="bg-white rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">У вас</p>
                <p className="text-2xl font-bold">120 бонусов</p>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4m-4-4h4" />
                </svg>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Адреса доставки</h3>
                <button 
                  onClick={() => setIsAddAddressModalOpen(true)}
                  className="text-orange-500 text-sm"
                >
                  Добавить
                </button>
              </div>
              {addresses.length > 0 ? (
                <div className="space-y-2">
                  {addresses.map((address) => (
                    <div key={address.address_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{address.name}</p>
                          <p className="text-xs text-gray-500">{address.address}</p>
                          {address.apartment && <p className="text-xs text-gray-500">кв. {address.apartment}</p>}
                        </div>
                      </div>
                      <button className="text-red-500 text-sm">
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Нет сохраненных адресов</p>
              )}
            </div>

            {/* Store Section */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Магазины самовывоза</h3>
              </div>
              {businesses.length > 0 ? (
                <div className="space-y-2">
                  {businesses.slice(0, 3).map((business) => (
                    <div key={business.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{business.name}</p>
                        <p className="text-xs text-gray-500">{business.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Нет доступных магазинов</p>
              )}
            </div>

            {/* Payment Methods Section */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Способы оплаты</h3>
                <button 
                  onClick={() => setIsAddCardModalOpen(true)}
                  className="text-orange-500 text-sm"
                >
                  Добавить
                </button>
              </div>
              {isLoadingCards ? (
                <p className="text-gray-500 text-sm">Загрузка...</p>
              ) : cards.length > 0 ? (
                <div className="space-y-2">
                  {cards.map((card) => (
                    <div key={card.card_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">**** **** **** {card.mask}</p>
                          <p className="text-xs text-gray-500">Банковская карта</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteCard(card.card_id)}
                        disabled={cardActionLoading === card.card_id}
                        className="text-red-500 text-sm disabled:opacity-50"
                      >
                        {cardActionLoading === card.card_id ? 'Удаление...' : 'Удалить'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Нет сохраненных карт</p>
              )}
            </div>

            {/* Logout Button */}
            <div className="pt-4">
              <button
                onClick={logout}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-medium"
              >
                Выйти
              </button>
            </div>
          </>
        )}

        {activeTab === 'Заказы' && (
          <div className="bg-white rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Заказы</h3>
            <p className="text-gray-500">У вас пока нет заказов</p>
          </div>
        )}

        {activeTab === 'Избранное' && (
          <div className="bg-white rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Избранное</h3>
            <p className="text-gray-500">Вы пока ничего не добавили в избранное</p>
          </div>
        )}
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>

      {/* Modals */}
      {isAddAddressModalOpen && (
        <AddAddressModal
          isOpen={isAddAddressModalOpen}
          onClose={() => setIsAddAddressModalOpen(false)}
        />
      )}

      {isAddCardModalOpen && (
        <AddCardModal
          isOpen={isAddCardModalOpen}
          onClose={() => setIsAddCardModalOpen(false)}
          onSuccess={handleCardAdded}
        />
      )}
    </div>
  )
}
