import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'tenant-cart'

function readInitialCart() {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistCart(items) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore persistence errors
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readInitialCart)

  const save = useCallback((next) => {
    setItems(next)
    persistCart(next)
  }, [])

  const addItem = useCallback(
    (product, quantity = 1) => {
      if (!product?.id) return

      const qty = Math.max(1, Number(quantity) || 1)
      const cover = product.images?.[0]?.url || null

      setItems((prev) => {
        const existing = prev.find((item) => item.productId === product.id)
        const next = existing
          ? prev.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + qty }
                : item,
            )
          : [
              ...prev,
              {
                productId: product.id,
                name: product.name,
                price: Number(product.price) || 0,
                imageUrl: cover,
                businessType: product.businessType || null,
                organizationId: product.organizationId || null,
                organizationName: product.organizationName || null,
                quantity: qty,
              },
            ]

        persistCart(next)
        return next
      })
    },
    [],
  )

  const updateQuantity = useCallback((productId, quantity) => {
    const qty = Math.max(1, Number(quantity) || 1)
    setItems((prev) => {
      const next = prev.map((item) =>
        item.productId === productId ? { ...item, quantity: qty } : item,
      )
      persistCart(next)
      return next
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.productId !== productId)
      persistCart(next)
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    save([])
  }, [save])

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function useCartOptional() {
  return useContext(CartContext)
}

