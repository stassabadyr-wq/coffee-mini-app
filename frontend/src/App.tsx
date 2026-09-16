import { useState } from 'react'
import type { CartItem, Product, Screen, OrderResponse } from './types'
import { MenuScreen } from './screens/MenuScreen'
import { CartScreen } from './screens/CartScreen'
import { CheckoutScreen } from './screens/CheckoutScreen'
import { SuccessScreen } from './screens/SuccessScreen'

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [screen, setScreen] = useState<Screen>('menu')
  const [order, setOrder] = useState<OrderResponse | null>(null)

  // initData из Telegram — нужен для валидации на бэкенде
  const initData = window.Telegram?.WebApp?.initData || ''

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function removeFromCart(productId: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function resetApp() {
    setCart([])
    setOrder(null)
    setScreen('menu')
  }

  if (screen === 'success' && order) {
    return <SuccessScreen order={order} onReset={resetApp} />
  }

  if (screen === 'checkout') {
    return (
      <CheckoutScreen
        cart={cart}
        initData={initData}
        onBack={() => setScreen('cart')}
        onSuccess={(o) => {
          setOrder(o)
          setScreen('success')
        }}
      />
    )
  }

  if (screen === 'cart') {
    return (
      <CartScreen
        cart={cart}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onBack={() => setScreen('menu')}
        onCheckout={() => setScreen('checkout')}
      />
    )
  }

  return (
    <MenuScreen
      cart={cart}
      onAdd={addToCart}
      onRemove={removeFromCart}
      onOpenCart={() => setScreen('cart')}
    />
  )
}