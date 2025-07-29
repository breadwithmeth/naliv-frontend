import { useEffect } from 'react'
import { useBusiness } from '../contexts/BusinessContext'
import { useCart } from '../contexts/CartContext'

export default function CartBusinessConnection() {
  const { setOnBusinessChange } = useBusiness()
  const { clearCart } = useCart()

  useEffect(() => {
    // Устанавливаем callback для очистки корзины при смене магазина
    setOnBusinessChange(clearCart)
  }, [setOnBusinessChange, clearCart])

  return null // Этот компонент не рендерит ничего
}
