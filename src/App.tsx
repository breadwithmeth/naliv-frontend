import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { BusinessProvider } from './contexts/BusinessContext'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'
import { AddressProvider } from './contexts/AddressContext'
import { useBusiness } from './contexts/BusinessContext'
import { useCart } from './contexts/CartContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Catalog from './pages/Catalog'
import Stores from './pages/Stores'
import Category from './pages/Category'
import Item from './pages/Item'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCallback from './pages/PaymentCallback'
import OrderPayment from './pages/OrderPayment'
import CardSuccess from './pages/CardSuccess'
import CardFailure from './pages/CardFailure'
import UnpaidOrders from './pages/UnpaidOrders'
import OrderDetails from './pages/OrderDetails'
import Auth from './pages/Auth'

// Компонент для подключения очистки корзины при смене магазина
function AppContent() {
  const { setOnBusinessChange } = useBusiness()
  const { clearCart } = useCart()

  useEffect(() => {
    // Устанавливаем callback для очистки корзины при смене магазина
    const handleBusinessChange = () => {
      console.log('handleBusinessChange вызван в App.tsx')
      console.log('Магазин изменен, очищаем корзину')
      clearCart()
    }
    
    console.log('Устанавливаем callback для очистки корзины')
    setOnBusinessChange(handleBusinessChange)
  }, [setOnBusinessChange, clearCart])

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="stores" element={<Stores />} />
        <Route path="category/:categoryId" element={<Category />} />
        <Route path="item/:itemId" element={<Item />} />
        <Route path="profile" element={<Profile />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-success" element={<OrderSuccess />} />
        <Route path="payment-success" element={<PaymentSuccess />} />
        <Route path="payment-callback" element={<PaymentCallback />} />
        <Route path="order-payment/:orderId" element={<OrderPayment />} />
        <Route path="orders/:orderId" element={<OrderDetails />} />
        <Route path="orders" element={<UnpaidOrders />} />
        <Route path="unpaid-orders" element={<UnpaidOrders />} />
        <Route path="cards/success" element={<CardSuccess />} />
        <Route path="cards/failure" element={<CardFailure />} />
        <Route path="auth" element={<Auth />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BusinessProvider>
      <CartProvider>
        <AuthProvider>
          <AddressProvider>
            <AppContent />
          </AddressProvider>
        </AuthProvider>
      </CartProvider>
    </BusinessProvider>
  )
}

export default App
