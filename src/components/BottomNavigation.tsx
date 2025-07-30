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
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      name: 'Каталог',
      path: '/catalog',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
        </svg>
      ),
    },
    {
      name: 'Профиль',
      path: '/profile',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ),
    },
    {
      name: 'Корзина',
      path: '/cart',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 safe-area-inset-bottom">
      <div className="bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-material-3 mx-auto max-w-sm">
        <div className="flex items-center justify-around px-2 py-1">
          {navigationItems.map(item => {
            const isActive = location.pathname === item.path
            const isCart = item.path === '/cart'

            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center relative group"
              >
                {/* Active background */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary-500/10 rounded-2xl -m-2 transition-all duration-300"></div>
                )}

                {/* Cart special styling with price badge */}
                {isCart && cartItemsCount > 0 ? (
                  <div className="relative z-10 bg-primary-500 text-white rounded-full px-3 py-2 flex items-center space-x-1 mb-1 shadow-material-2 transition-all duration-300 group-hover:shadow-material-3">
                    <div className="w-4 h-4 text-white">{item.icon}</div>
                    <span className="text-xs font-semibold">
                      {totalPrice.toFixed(0)} ₸
                    </span>
                  </div>
                ) : (
                  <div className="relative z-10 p-2 rounded-2xl transition-all duration-300 group-hover:bg-gray-100/50">
                    <div
                      className={`transition-all duration-300 ${
                        isActive
                          ? 'text-primary-500 scale-110'
                          : 'text-gray-400 group-hover:text-gray-600'
                      }`}
                    >
                      {item.icon}
                    </div>
                  </div>
                )}

                <span
                  className={`text-xs font-medium relative z-10 transition-all duration-300 ${
                    isActive
                      ? 'text-primary-500'
                      : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                >
                  {item.name}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"></div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
