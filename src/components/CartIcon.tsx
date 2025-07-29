import { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import CartModal from './CartModal'

export default function CartIcon() {
  const { getTotalItems } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const totalItems = getTotalItems()

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 21l1.5-1.5m11 1.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" 
          />
        </svg>
        
        {/* Бейдж с количеством товаров */}
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </button>

      {/* Модальное окно корзины */}
      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  )
}
