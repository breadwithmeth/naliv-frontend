import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import CartModal from './CartModal'

export default function Sidebar() {
  const { getTotalItems } = useCart()
  const [isCartModalOpen, setIsCartModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const totalItems = getTotalItems()

  const isActive = (path: string) => location.pathname === path

  const navigationItems = [
    { path: '/', label: 'Главная', icon: 'home' },
    { path: '/stores', label: 'Магазины', icon: 'store' },
    { path: '/cart', label: 'Корзина', icon: 'shopping_cart' },
    { path: '/profile', label: 'Профиль', icon: 'person' },
  ]

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900 text-xl">НАЛИВ</span>
        </Link>
        
        <button
          onClick={() => setIsCartModalOpen(true)}
          className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
        >
          <span className="material-icons text-gray-700">shopping_cart</span>
          {totalItems > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems > 99 ? '99+' : totalItems}
            </div>
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-20 bg-white/95 backdrop-blur-lg border-r border-gray-200 z-50 flex flex-col transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Header - Empty space */}
        <div className="h-16 border-b border-gray-200"></div>

        {/* Navigation */}
        <nav className="flex-1 py-6 bg-gray-50/50">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path === '/cart' ? '#' : item.path}
              onClick={(e) => {
                if (item.path === '/cart') {
                  e.preventDefault()
                  setIsCartModalOpen(true)
                } else {
                  closeMobileMenu()
                }
              }}
              className={`sidebar-nav-item flex-col py-6 px-3 mb-3 mx-2 rounded-2xl relative group transition-all duration-300 ${
                isActive(item.path) ? 'bg-blue-100 text-blue-600 shadow-lg' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {/* Material Design Icon */}
              <span className="material-icons text-2xl mb-2 transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              
              {/* Vertical Text */}
              <div className="writing-mode-vertical text-sm font-medium tracking-wider text-center">
                {item.label}
              </div>
              
              {/* Active Indicator */}
              {isActive(item.path) && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-full"></div>
              )}
              
              {/* Cart Badge */}
              {item.path === '/cart' && totalItems > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </div>
              )}
            </Link>
          ))}
        </nav>

      </div>

      {/* Modals */}
      <CartModal 
        isOpen={isCartModalOpen} 
        onClose={() => setIsCartModalOpen(false)} 
      />
    </>
  )
}
