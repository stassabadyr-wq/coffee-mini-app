import { useState } from 'react'
import type { CartItem, OrderResponse } from '../types'
import { createOrder } from '../api/client'

interface CheckoutScreenProps {
  cart: CartItem[]
  initData: string
  onBack: () => void
  onSuccess: (order: OrderResponse) => void
}

export function CheckoutScreen({ cart, initData, onBack, onSuccess }: CheckoutScreenProps) {
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  async function handleSubmit() {
    setError(null)

    // Простая валидация
    const cleaned = phone.replace(/[^\d+]/g, '')
    if (cleaned.length < 5) {
      setError('Введите корректный номер телефона')
      return
    }

    setSubmitting(true)

    try {
      const items = cart.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
      }))

      const response = await createOrder(initData, cleaned, items)
      onSuccess(response)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось оформить заказ')
      setSubmitting(false)
    }
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={onBack} disabled={submitting}>←</button>
        <span className="top-bar-title">Оформление</span>
      </div>

      <div className="checkout-summary">
        {cart.map((item) => (
          <div key={item.product.id} className="checkout-row">
            <span>{item.product.emoji} {item.product.name} × {item.quantity}</span>
            <span>{item.product.price * item.quantity} ₽</span>
          </div>
        ))}
        <div className="checkout-row checkout-total">
          <span>Итого</span>
          <span>{totalPrice} ₽</span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">📞 Телефон для связи</label>
        <input
          type="tel"
          className="form-input"
          placeholder="+7 999 123-45-67"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={submitting}
          autoComplete="tel"
        />
        <div className="form-hint">
          Мы позвоним, если возникнут вопросы по заказу
        </div>
      </div>

      {error && (
        <div className="form-error">❌ {error}</div>
      )}

      <button
        className="checkout-btn"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? '⏳ Отправляем…' : `Подтвердить · ${totalPrice} ₽`}
      </button>
    </div>
  )
}