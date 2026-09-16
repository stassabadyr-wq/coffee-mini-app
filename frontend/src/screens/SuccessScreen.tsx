import type { OrderResponse } from '../types'

interface SuccessScreenProps {
  order: OrderResponse
  onReset: () => void
}

export function SuccessScreen({ order, onReset }: SuccessScreenProps) {
  return (
    <div className="screen success-screen">
      <div className="success-emoji">✅</div>
      <h1 className="success-title">Заказ оформлен!</h1>
      <p className="success-text">
        Заказ <strong>№{order.order_id}</strong><br />
        Сумма: <strong>{order.total} ₽</strong>
      </p>
      <p className="success-hint">
        Мы свяжемся с вами в ближайшее время.
      </p>
      <button className="success-btn" onClick={onReset}>
        ← Вернуться к меню
      </button>
    </div>
  )
}