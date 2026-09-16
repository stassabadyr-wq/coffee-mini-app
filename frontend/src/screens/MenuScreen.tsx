import { useEffect, useState } from 'react'
import type { CartItem, Product } from '../types'
import { fetchProducts } from '../api/client'
import { ProductCard } from '../components/ProductCard'

interface MenuScreenProps {
  cart: CartItem[]
  onAdd: (product: Product) => void
  onRemove: (productId: number) => void
  onOpenCart: () => void
}

type Category = 'all' | 'coffee' | 'dessert'

export function MenuScreen({ cart, onAdd, onRemove, onOpenCart }: MenuScreenProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<Category>('all')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить меню')
    } finally {
      setLoading(false)
    }
  }

  const filtered =
    category === 'all' ? products : products.filter((p) => p.category === category)

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  if (loading) {
    return <div className="loading">⏳ Загружаем меню...</div>
  }

  if (error) {
    return (
      <div className="error-state">
        <div>❌ {error}</div>
        <button onClick={loadProducts}>Попробовать снова</button>
      </div>
    )
  }

  return (
    <div className="screen menu-screen">
      <div className="categories">
        <button
          className={category === 'all' ? 'cat active' : 'cat'}
          onClick={() => setCategory('all')}
        >
          Всё
        </button>
        <button
          className={category === 'coffee' ? 'cat active' : 'cat'}
          onClick={() => setCategory('coffee')}
        >
          ☕ Кофе
        </button>
        <button
          className={category === 'dessert' ? 'cat active' : 'cat'}
          onClick={() => setCategory('dessert')}
        >
          🍰 Десерты
        </button>
      </div>

      <div className="products">
        {filtered.map((p) => {
          const inCart = cart.find((c) => c.product.id === p.id)
          return (
            <ProductCard
              key={p.id}
              product={p}
              quantity={inCart?.quantity ?? 0}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          )
        })}
      </div>

      {totalItems > 0 && (
        <div className="cart-bar" onClick={onOpenCart}>
          <div className="cart-bar-info">
            🛒 {totalItems} поз. · {totalPrice} ₽
          </div>
          <div className="cart-bar-arrow">Перейти →</div>
        </div>
      )}
    </div>
  )
}