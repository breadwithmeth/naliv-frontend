import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useBusiness } from '../contexts/BusinessContext'
import { useCart } from '../contexts/CartContext'
import ItemOptionsModal from '../components/ItemOptionsModal'
import OptionsIndicator from '../components/OptionsIndicator'

interface Category {
  category_id: number
  name: string
  parent_category: number
  photo: string
  img: string
}

interface Business {
  business_id: number
  name: string
  address: string
  city_name?: string
}

interface OptionVariant {
  relation_id: number
  item_id: number
  price_type: "ADD" | "REPLACE"
  price: number
  parent_item_amount: number
}

interface ItemOption {
  option_id: number
  name: string
  required: number
  selection: "SINGLE" | "MULTIPLE"
  variants: OptionVariant[]
}

interface Item {
  item_id: number
  name: string
  description: string
  price: number
  amount: number
  quantity: number
  unit: string
  img: string
  code: string
  visible: number
  business_id: number
  category: Category
  options: ItemOption[]
}

interface ItemApiResponse {
  success: boolean
  data: {
    item: Item
    business: Business
    options: any[]
    promotions: any[]
  }
  message: string
}

// Локальный placeholder для изображений
const DEFAULT_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwSDIyNVYyNTBIMTc1VjE1MFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHA+dGV4dCB4PSIyMDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3Mjg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7QndC10YIg0LjQt9C+0LHRgNCw0LbQtdC90LjRjzwvdGV4dD4KPC9zdmc+'

export default function Item() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const { selectedBusiness } = useBusiness()
  const { addItem, getItemQuantity } = useCart()
  
  const [item, setItem] = useState<Item | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)

  useEffect(() => {
    if (!itemId) {
      navigate('/')
      return
    }

    if (!selectedBusiness) {
      navigate('/')
      return
    }

    const fetchItem = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`http://localhost:3000/api/categories/items/${itemId}?business_id=${selectedBusiness.id}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: ItemApiResponse = await response.json()

        if (data.success) {
          setItem(data.data.item)
          setBusiness(data.data.business)
        } else {
          setError('Товар не найден')
        }

      } catch (err) {
        setError('Не удалось загрузить данные')
        console.error('Error fetching item:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [itemId, navigate, selectedBusiness])

  const handleOptionsConfirm = (selectedOptions: any[]) => {
    if (selectedBusiness && item) {
      let totalQuantity = 1
      
      selectedOptions.forEach(option => {
        if (option.variant.parent_item_amount > 1) {
          totalQuantity = option.variant.parent_item_amount
        }
      })

      for (let i = 0; i < totalQuantity; i++) {
        addItem({
          item_id: item.item_id,
          name: item.name,
          price: item.price,
          amount: item.amount,
          quantity: item.quantity,
          unit: item.unit,
          img: item.img || DEFAULT_IMAGE,
          code: item.code,
          business_id: selectedBusiness.id,
          selectedOptions
        })
      }
    }
    setIsOptionsModalOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем товар...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Ошибка</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium"
          >
            Назад
          </button>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">❓</div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Товар не найден</h2>
          <p className="text-gray-600 mb-4">Такого товара не существует</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium"
          >
            На главную
          </button>
        </div>
      </div>
    )
  }

  const cartQuantity = getItemQuantity(item.item_id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button 
          onClick={() => window.history.back()}
          className="mr-3"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-medium flex-1 line-clamp-1">{item.name}</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="aspect-square bg-gray-100">
            <img
              src={item.img}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_IMAGE
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h2>
          
          <div className="flex items-baseline space-x-2 mb-3">
            <span className="text-2xl font-bold text-gray-900">
              {(item.price / 1).toFixed(2)} ₸
            </span>
            <span className="text-gray-500">
              за {item.quantity} {item.unit}
            </span>
          </div>

          <div className="flex items-center mb-4">
            {item.visible === 1 && item.amount > 0 ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600 font-medium">В наличии: {item.amount} шт.</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-red-600 font-medium">Нет в наличии</span>
              </>
            )}
          </div>

          {item.options && item.options.length > 0 && (
            <div className="mb-4">
              <OptionsIndicator options={item.options} variant="compact" />
            </div>
          )}

          {cartQuantity > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-700">В корзине:</span>
                <span className="font-medium text-orange-700">{cartQuantity} шт.</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Описание</h3>
          <div 
            className="text-gray-600 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: item.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
            }}
          />
        </div>

        <div className="bg-white rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-gray-900 mb-3">Информация о товаре</h3>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Код товара:</span>
            <span className="text-gray-900">{item.code}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Категория:</span>
            <Link 
              to={`/category/${item.category.category_id}`}
              className="text-orange-500 hover:text-orange-600"
            >
              {item.category.name}
            </Link>
          </div>

          {business && (
            <div className="flex justify-between">
              <span className="text-gray-500">Магазин:</span>
              <div className="text-right">
                <div className="text-gray-900 text-sm">{business.name}</div>
                <div className="text-gray-500 text-xs">
                  {business.city_name && `${business.city_name}, `}{business.address}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <button className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-lg font-medium">
            ❤️ В избранное
          </button>
          <button 
            onClick={() => {
              if (selectedBusiness) {
                if (item.options && item.options.length > 0) {
                  setIsOptionsModalOpen(true)
                } else {
                  addItem({
                    item_id: item.item_id,
                    name: item.name,
                    price: item.price,
                    amount: item.amount,
                    quantity: item.quantity,
                    unit: item.unit,
                    img: item.img || DEFAULT_IMAGE,
                    code: item.code,
                    business_id: selectedBusiness.id,
                    selectedOptions: []
                  })
                }
              }
            }}
            disabled={item.amount <= 0}
            className={`flex-1 py-3 rounded-lg font-medium ${
              item.amount <= 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {(() => {
              if (item.amount <= 0) return 'Нет в наличии'
              if (item.options && item.options.length > 0) return 'Выбрать опции'
              if (cartQuantity > 0) return `В корзину (+${cartQuantity})`
              return 'В корзину'
            })()}
          </button>
        </div>
      </div>

      {/* Bottom Padding for Fixed Actions */}
      <div className="h-24"></div>
      
      {item && item.options && (
        <ItemOptionsModal
          isOpen={isOptionsModalOpen}
          onClose={() => setIsOptionsModalOpen(false)}
          options={item.options}
          basePrice={item.price}
          itemName={item.name}
          onConfirm={handleOptionsConfirm}
        />
      )}
    </div>
  )
}
