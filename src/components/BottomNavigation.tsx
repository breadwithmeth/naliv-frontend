import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

export default function BottomNavigation() {
  const location = useLocation()
  const { getTotalItems, getTotalPrice } = useCart()
  const cartItemsCount = getTotalItems()
  const totalPrice = getTotalPrice()

  const navigationItems = [
    {
      name: 'Главная',
      path: '/',
      icon: '♦'
    },
    {
      name: 'Каталог',
      path: '/catalog',
      icon: '●'
    },
    {
      name: 'Профиль',
      path: '/profile',
      icon: '▲'
    },
    {
      name: 'Корзина',
      path: '/cart',
      icon: '🛒'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path
          const isCart = item.path === '/cart'
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center py-2 px-3 relative"
            >
              {/* Cart special styling with price badge */}
              {isCart && cartItemsCount > 0 ? (
                <div className="bg-black text-white rounded-full px-3 py-1 flex items-center space-x-1 mb-1">
                  <span className="text-xs font-semibold">{totalPrice} ₸</span>
                </div>
              ) : (
                <div className="relative mb-1">
                  <span className={`text-2xl ${isActive ? 'text-black' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                </div>
              )}
              
              <span className={`text-xs font-medium ${isActive ? 'text-black' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
