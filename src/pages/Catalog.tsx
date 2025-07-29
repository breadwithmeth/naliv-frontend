import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Category {
  category_id: number
  name: string
  photo?: string
  parent_category: number
  img?: string
  visible: number
  subcategories: Category[]
  items_count: number
}

interface CategoriesApiResponse {
  success: boolean
  data: {
    categories: Category[]
  }
}

export default function Catalog() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:3000/api/categories')
        const data: CategoriesApiResponse = await response.json()
        
        if (data.success) {
          // Фильтруем только основные категории (parent_category = 0)
          const mainCategories = data.data.categories.filter(cat => cat.parent_category === 0)
          setCategories(mainCategories)
        } else {
          setError('Ошибка загрузки категорий')
        }
      } catch (err) {
        setError('Не удалось подключиться к серверу')
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
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
          <h1 className="text-lg font-medium flex-1">Каталог</h1>
        </div>

        {/* Loading skeleton */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
          <h1 className="text-lg font-medium flex-1">Каталог</h1>
        </div>

        {/* Error state */}
        <div className="px-4 py-8 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-500">{error}</p>
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
        <h1 className="text-lg font-medium flex-1">Каталог</h1>
      </div>

      {/* Categories Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <Link
              key={category.category_id}
              to={`/category/${category.category_id}`}
              className="bg-white rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{category.items_count} товаров</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  )
}
