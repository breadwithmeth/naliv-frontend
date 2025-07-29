import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'

interface SelectedOption {
  option_id: number
  variant: {
    relation_id: number
    item_id: number
    price_type: "ADD" | "REPLACE"
    price: number
    parent_item_amount: number
  }
}

interface CartItem {
  item_id: number
  name: string
  price: number
  amount: number
  quantity: number
  unit: string
  img: string
  code: string
  cartQuantity: number
  business_id: number
  selectedOptions: SelectedOption[]
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'cartQuantity'>) => void
  removeItem: (itemId: number) => void
  updateQuantity: (itemId: number, cartQuantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  isItemInCart: (itemId: number) => boolean
  getItemQuantity: (itemId: number) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Загружаем корзину из localStorage при инициализации
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        setItems(cartItems)
      } catch (err) {
        console.error('Error parsing saved cart:', err)
      }
    }
  }, [])

  // Сохраняем корзину в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = useCallback((newItem: Omit<CartItem, 'cartQuantity'>) => {
    console.log('Попытка добавить товар в корзину:', {
      item_id: newItem.item_id,
      name: newItem.name,
      amount: newItem.amount,
      business_id: newItem.business_id
    })
    
    setItems(prevItems => {
      console.log('Текущие товары в корзине:', prevItems.length)
      const existingItem = prevItems.find(item => item.item_id === newItem.item_id)
      
      if (existingItem) {
        console.log('Товар уже есть в корзине, текущее количество:', existingItem.cartQuantity)
        // Если товар уже есть в корзине, проверяем остаток перед увеличением
        const newCartQuantity = existingItem.cartQuantity + 1
        if (newCartQuantity <= newItem.amount) {
          console.log('Увеличиваем количество до:', newCartQuantity)
          return prevItems.map(item =>
            item.item_id === newItem.item_id
              ? { ...item, cartQuantity: newCartQuantity, amount: newItem.amount }
              : item
          )
        } else {
          // Если превышает остаток, не добавляем
          console.warn(`Нельзя добавить больше товара. В наличии: ${newItem.amount}`)
          return prevItems
        }
      } else {
        // Если товара нет в корзине, добавляем с количеством 1
        if (newItem.amount > 0) {
          console.log('Добавляем новый товар в корзину')
          return [...prevItems, { ...newItem, cartQuantity: 1 }]
        } else {
          console.warn('Товар закончился')
          return prevItems
        }
      }
    })
  }, [])

  const removeItem = useCallback((itemId: number) => {
    setItems(prevItems => prevItems.filter(item => item.item_id !== itemId))
  }, [])

  const updateQuantity = useCallback((itemId: number, cartQuantity: number) => {
    if (cartQuantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.item_id === itemId) {
          // Проверяем, не превышает ли новое количество остаток
          if (cartQuantity <= item.amount) {
            return { ...item, cartQuantity }
          } else {
            console.warn(`Нельзя добавить больше товара. В наличии: ${item.amount}`)
            return item
          }
        }
        return item
      })
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    console.log('Очищаем корзину, было товаров:', items.length)
    setItems([])
  }, [])

  const getTotalItems = useCallback(() => {
    const total = items.reduce((total, item) => total + item.cartQuantity, 0)
    console.log('getTotalItems вызван, товаров в корзине:', items.length, 'общее количество:', total)
    return total
  }, [items])

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.cartQuantity), 0)
  }, [items])

  const isItemInCart = useCallback((itemId: number) => {
    return items.some(item => item.item_id === itemId)
  }, [items])

  const getItemQuantity = useCallback((itemId: number) => {
    const item = items.find(item => item.item_id === itemId)
    return item ? item.cartQuantity : 0
  }, [items])

  const value = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isItemInCart,
    getItemQuantity
  }), [items, addItem, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice, isItemInCart, getItemQuantity])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
