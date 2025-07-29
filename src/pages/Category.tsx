import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useBusiness } from '../contexts/BusinessContext'
import { useCart } from '../contexts/CartContext'
import ItemOptionsModal from '../components/ItemOptionsModal'
import OptionsIndicator from '../components/OptionsIndicator'

// Локальные placeholder изображения
const DEFAULT_ITEM_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA3NUgxMTNWMTI1SDg3Vjc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIxMDAiIHk9IjE0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNkI3Mjg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7QndC10YIg0LjQt9C+0LHRgNCw0LbQtdC90LjRjzwvdGV4dD4KPC9zdmc+'
const DEFAULT_THUMB_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAyNEgzNlY0MEgyOFYyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHR4dCB4PSIzMiIgeT0iNDgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSIjNkI3Mjg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7QndC10YIg0YTQvtGC0L48L3R4dD4KPC9zdmc+'

interface Subcategory {
  category_id: number
  name: string
  photo?: string | null
  parent_category: number
  img?: string
  visible: number
}

interface Category {
  category_id: number
  name: string
  photo?: string | null
  parent_category: number
  img?: string
  visible: number
  subcategories: Subcategory[]
  parent?: Category | null
}

interface CategoryApiResponse {
  success: boolean
  data: {
    category: Category
  }
  message: string
}

interface Promotion {
  detail_id: number
  type: string
  base_amount: number
  add_amount: number
  discount: number | null
  name: string
  promotion: {
    marketing_promotion_id: number
    name: string
    start_promotion_date: string
    end_promotion_date: string
  }
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
  category: {
    category_id: number
    name: string
    parent_category: number
  }
  visible: number
  promotions: Promotion[]
  options: ItemOption[]
}

interface ItemsApiResponse {
  success: boolean
  data: {
    items: Item[]
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  message: string
}

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const { selectedBusiness } = useBusiness()
  const { addItem, getItemQuantity } = useCart()
  
  const [category, setCategory] = useState<Category | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [itemsLoading, setItemsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const limit = 50

  const fetchItems = useCallback(async (page: number = 1) => {
    if (!categoryId || !selectedBusiness) return

    try {
      setItemsLoading(true)
      const response = await fetch(
        `http://localhost:3000/api/categories/${categoryId}/items?business_id=${selectedBusiness.id}&page=${page}&limit=${limit}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ItemsApiResponse = await response.json()

      if (data.success) {
        setItems(data.data.items)
        if (data.data.pagination) {
          setTotalPages(data.data.pagination.totalPages)
        }
      }

    } catch (err) {
      console.error('Error fetching items:', err)
    } finally {
      setItemsLoading(false)
    }
  }, [categoryId, selectedBusiness, limit])

  useEffect(() => {
    if (!categoryId) {
      navigate('/')
      return
    }

    const fetchCategory = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: CategoryApiResponse = await response.json()

        if (data.success) {
          setCategory(data.data.category)
          if (selectedBusiness) {
            fetchItems(1)
          }
        } else {
          setError('Категория не найдена')
        }

      } catch (err) {
        setError('Не удалось загрузить данные')
        console.error('Error fetching category:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [categoryId, navigate])

  useEffect(() => {
    if (selectedBusiness && category) {
      fetchItems(1)
      setCurrentPage(1)
    }
  }, [selectedBusiness, category, fetchItems])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchItems(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOptionsConfirm = (selectedOptions: unknown[]) => {
    if (selectedItem && selectedBusiness) {
      let totalQuantity = 1
      
      selectedOptions.forEach((option: any) => {
        if (option.variant.parent_item_amount > 1) {
          totalQuantity = option.variant.parent_item_amount
        }
      })

      for (let i = 0; i < totalQuantity; i++) {
        addItem({
          item_id: selectedItem.item_id,
          name: selectedItem.name,
          price: selectedItem.price,
          amount: selectedItem.amount,
          quantity: selectedItem.quantity,
          unit: selectedItem.unit,
          img: selectedItem.img || DEFAULT_ITEM_IMAGE,
          code: selectedItem.code,
          business_id: selectedBusiness.id,
          selectedOptions: selectedOptions as any
        })
      }
      setSelectedItem(null)
    }
    setIsOptionsModalOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем категорию...</p>
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
          <Link 
            to="/" 
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium inline-block"
          >
            На главную
          </Link>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">❓</div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Категория не найдена</h2>
          <p className="text-gray-600 mb-4">Такой категории не существует</p>
          <Link 
            to="/" 
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium inline-block"
          >
            На главную
          </Link>
        </div>
      </div>
    )
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
        <h1 className="text-lg font-medium flex-1">{category.name}</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Store Info */}
        {selectedBusiness && (
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">{selectedBusiness.name}</h3>
                <p className="text-xs text-gray-500">
                  {selectedBusiness.city_name && `${selectedBusiness.city_name}, `}{selectedBusiness.address}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subcategories */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Подкатегории</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {category.subcategories.map((subcategory) => (
                <Link
                  key={subcategory.category_id}
                  to={`/category/${subcategory.category_id}`}
                  className="bg-white rounded-lg p-3 border border-gray-200"
                >
                  <h4 className="font-medium text-gray-900 text-sm text-center">
                    {subcategory.name}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Items Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Товары</h3>
          
          {itemsLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Загружаем товары...</p>
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.item_id} className="bg-white rounded-lg p-4">
                    <div className="flex space-x-3">
                      {/* Item Image */}
                      <Link to={`/item/${item.item_id}`} className="flex-shrink-0">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_THUMB_IMAGE
                          }}
                        />
                      </Link>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/item/${item.item_id}`}>
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                            {item.name}
                          </h4>
                        </Link>
                        
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-lg font-bold text-gray-900">
                              {(item.price / 1).toFixed(2)} ₸
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              за {item.quantity} {item.unit}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">#{item.code}</span>
                        </div>

                        {/* Stock and Options */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {item.amount > 0 ? (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                item.amount <= 5 
                                  ? 'bg-orange-100 text-orange-600' 
                                  : 'bg-green-100 text-green-600'
                              }`}>
                                {item.amount} шт.
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                                Нет в наличии
                              </span>
                            )}
                            {item.options && item.options.length > 0 && (
                              <OptionsIndicator options={item.options} variant="compact" />
                            )}
                          </div>

                          {/* Cart Quantity */}
                          {(() => {
                            const cartQuantity = getItemQuantity(item.item_id)
                            return cartQuantity > 0 && (
                              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                В корзине: {cartQuantity}
                              </span>
                            )
                          })()}
                        </div>

                        {/* Promotions */}
                        {item.promotions.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                              🔥 {item.promotions[0].name}
                            </span>
                          </div>
                        )}

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => {
                            if (selectedBusiness) {
                              if (item.options && item.options.length > 0) {
                                setSelectedItem(item)
                                setIsOptionsModalOpen(true)
                              } else {
                                addItem({
                                  item_id: item.item_id,
                                  name: item.name,
                                  price: item.price,
                                  amount: item.amount,
                                  quantity: item.quantity,
                                  unit: item.unit,
                                  img: item.img || DEFAULT_ITEM_IMAGE,
                                  code: item.code,
                                  business_id: selectedBusiness.id,
                                  selectedOptions: []
                                })
                              }
                            }
                          }}
                          disabled={item.amount <= 0}
                          className={`w-full mt-3 py-2 px-3 rounded-lg text-sm font-medium ${
                            item.amount <= 0 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                          }`}
                        >
                          {(() => {
                            const cartQuantity = getItemQuantity(item.item_id)
                            if (item.amount <= 0) return 'Недоступно'
                            if (item.options && item.options.length > 0) return 'Выбрать опции'
                            if (cartQuantity > 0) return `В корзину (+${cartQuantity})`
                            return 'В корзину'
                          })()}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm bg-white text-gray-700 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>

                  <span className="px-3 py-2 text-sm text-gray-600">
                    {currentPage} из {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm bg-white text-gray-700 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🛒</div>
              <p className="text-gray-600 text-sm">В этой категории пока нет товаров</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>

      {/* Options Modal */}
      {selectedItem && (
        <ItemOptionsModal 
          isOpen={isOptionsModalOpen}
          onClose={() => {
            setIsOptionsModalOpen(false)
            setSelectedItem(null)
          }}
          options={selectedItem.options || []}
          basePrice={selectedItem.price}
          onConfirm={handleOptionsConfirm}
          itemName={selectedItem.name}
        />
      )}
    </div>
  )
}
