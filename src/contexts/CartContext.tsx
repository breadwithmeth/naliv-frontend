import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'

interface SelectedOption {
  option_id: number
  variant: {
    relation_id: number
    item_id: number
    price_type: 'ADD' | 'REPLACE'
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
  saveCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Загружаем корзину из localStorage при инициализации
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)

        // Валидируем данные корзины
        if (Array.isArray(cartItems)) {
          const validCartItems = cartItems.filter(
            item =>
              item &&
              typeof item.item_id === 'number' &&
              typeof item.name === 'string' &&
              typeof item.price === 'number' &&
              typeof item.cartQuantity === 'number' &&
              typeof item.business_id === 'number'
          )

          console.log(
            'Загружаем корзину из localStorage:',
            validCartItems.length,
            'товаров (из',
            cartItems.length,
            'сохраненных)'
          )
          setItems(validCartItems)
        } else {
          console.warn('Некорректные данные корзины в localStorage, очищаем')
          localStorage.removeItem('cart')
        }
      } catch (err) {
        console.error('Ошибка при загрузке корзины из localStorage:', err)
        localStorage.removeItem('cart')
      }
    }
    setIsInitialized(true)
  }, [])

  // Сохраняем корзину в localStorage при изменении (только после инициализации)
  useEffect(() => {
    if (isInitialized) {
      console.log('Сохраняем корзину в localStorage:', items.length, 'товаров')
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, isInitialized])

  const addItem = useCallback((newItem: Omit<CartItem, 'cartQuantity'>) => {
    console.log('Попытка добавить товар в корзину:', {
      item_id: newItem.item_id,
      name: newItem.name,
      amount: newItem.amount,
      business_id: newItem.business_id,
      selectedOptions: newItem.selectedOptions,
    })

    // Рассчитываем количество товаров для добавления на основе parent_item_amount из опций
    let quantityToAdd = 1
    if (newItem.selectedOptions && newItem.selectedOptions.length > 0) {
      // Если есть выбранные опции, ищем максимальный parent_item_amount
      const maxParentAmount = Math.max(
        ...newItem.selectedOptions.map(
          option => option.variant.parent_item_amount || 1
        )
      )
      quantityToAdd = maxParentAmount
      console.log(
        'Товар с опциями, количество для добавления:',
        quantityToAdd,
        'опции:',
        newItem.selectedOptions
      )
    }

    setItems(prevItems => {
      console.log('Текущие товары в корзине:', prevItems.length)
      const existingItem = prevItems.find(
        item => item.item_id === newItem.item_id
      )

      if (existingItem) {
        console.log(
          'Товар уже есть в корзине, текущее количество:',
          existingItem.cartQuantity
        )
        // Если товар уже есть в корзине, проверяем остаток перед увеличением
        const newCartQuantity = existingItem.cartQuantity + quantityToAdd
        if (newCartQuantity <= newItem.amount) {
          console.log('Увеличиваем количество до:', newCartQuantity)
          return prevItems.map(item =>
            item.item_id === newItem.item_id
              ? {
                  ...item,
                  cartQuantity: newCartQuantity,
                  amount: newItem.amount,
                  selectedOptions: newItem.selectedOptions,
                }
              : item
          )
        } else {
          // Если превышает остаток, не добавляем
          console.warn(
            `Нельзя добавить больше товара. В наличии: ${newItem.amount}, пытаемся добавить: ${quantityToAdd}`
          )
          return prevItems
        }
      } else {
        // Если товара нет в корзине, добавляем с рассчитанным количеством
        if (newItem.amount >= quantityToAdd) {
          console.log(
            'Добавляем новый товар в корзину с количеством:',
            quantityToAdd
          )
          return [...prevItems, { ...newItem, cartQuantity: quantityToAdd }]
        } else {
          console.warn(
            'Недостаточно товара в наличии. Требуется:',
            quantityToAdd,
            'Доступно:',
            newItem.amount
          )
          return prevItems
        }
      }
    })
  }, [])

  const removeItem = useCallback((itemId: number) => {
    setItems(prevItems => prevItems.filter(item => item.item_id !== itemId))
  }, [])

  const updateQuantity = useCallback(
    (itemId: number, cartQuantity: number) => {
      if (cartQuantity <= 0) {
        removeItem(itemId)
        return
      }

      setItems(prevItems =>
        prevItems.map(item => {
          if (item.item_id === itemId) {
            // Рассчитываем множитель на основе parent_item_amount из опций
            let multiplier = 1
            if (item.selectedOptions && item.selectedOptions.length > 0) {
              multiplier = Math.max(
                ...item.selectedOptions.map(
                  option => option.variant.parent_item_amount || 1
                )
              )
            }

            // Фактическое количество с учетом множителя
            const actualQuantity = cartQuantity * multiplier

            console.log('Обновление количества товара:', {
              itemId,
              requestedQuantity: cartQuantity,
              multiplier,
              actualQuantity,
              availableAmount: item.amount,
            })

            // Проверяем, не превышает ли новое количество остаток
            if (actualQuantity <= item.amount) {
              return { ...item, cartQuantity: actualQuantity }
            } else {
              console.warn(
                `Нельзя добавить больше товара. В наличии: ${item.amount}, требуется: ${actualQuantity}`
              )
              return item
            }
          }
          return item
        })
      )
    },
    [removeItem]
  )

  const clearCart = useCallback(() => {
    console.log('Очищаем корзину, было товаров:', items.length)
    setItems([])
  }, [items.length])

  const getTotalItems = useCallback(() => {
    const total = items.reduce((total, item) => total + item.cartQuantity, 0)
    console.log(
      'getTotalItems вызван, товаров в корзине:',
      items.length,
      'общее количество:',
      total
    )
    return total
  }, [items])

  const getTotalPrice = useCallback(() => {
    return items.reduce(
      (total, item) => total + item.price * item.cartQuantity,
      0
    )
  }, [items])

  const isItemInCart = useCallback(
    (itemId: number) => {
      return items.some(item => item.item_id === itemId)
    },
    [items]
  )

  const getItemQuantity = useCallback(
    (itemId: number) => {
      const item = items.find(item => item.item_id === itemId)
      return item ? item.cartQuantity : 0
    },
    [items]
  )

  const saveCart = useCallback(() => {
    console.log(
      'Принудительное сохранение корзины в localStorage:',
      items.length,
      'товаров'
    )
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isItemInCart,
      getItemQuantity,
      saveCart,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isItemInCart,
      getItemQuantity,
      saveCart,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
