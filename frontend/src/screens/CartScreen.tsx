import type { CartItem } from '../types'

interface CartScreenProps {
  cart: CartItem[]
  onAdd: (product: CartItem['product']) => void
  onRemove: (productId: number) => void
  onBack: () => void
  onCheckout: () => void
}

export function CartScreen({ cart, onAdd, onRemove, onBack, onCheckout }: CartScreenProps) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  if (cart.length === 0) {
    return (
      <div className="screen">
        <div className="top-bar">
          <button className="back-btn" onClick={onBack}>←</button>
          <span className="top-bar-title">Корзина</span>
        </div>
        <div className="empty-state">
          <div className="empty-emoji">🛒</div>
          <div className="empty-text">Корзина пуста</div>
          <button className="empty-btn" onClick={onBack}>
            Вернуться к меню
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="top-bar-title">Корзина</span>
      </div>

      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.product.id} className="cart-item">
            <div className="cart-item-emoji">{item.product.emoji}</div>
            <div className="cart-item-info">
              <div className="cart-item-name">{item.product.name}</div>
              <div className="cart-item-price">{item.product.price} ₽</div>
            </div>
            <div className="product-counter">
              <button onClick={() => onRemove(item.product.id)}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => onAdd(item.product)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Позиций</span>
          <span>{totalItems}</span>
        </div>
        <div className="summary-row summary-total">
          <span>Итого</span>
          <span>{totalPrice} ₽</span>
        </div>
      </div>

      <button className="checkout-btn" onClick={onCheckout}>
        Оформить заказ · {totalPrice} ₽
      </button>
    </div>
  )
}