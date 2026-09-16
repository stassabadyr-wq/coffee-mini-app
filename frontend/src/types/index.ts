// Товар из меню
export interface Product {
  id: number
  name: string
  description: string
  price: number
  category: 'coffee' | 'dessert'
  emoji: string
}

// Позиция в корзине
export interface CartItem {
  product: Product
  quantity: number
}

// Данные пользователя из Telegram
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

// Ответ от API при создании заказа
export interface OrderResponse {
  ok: boolean
  order_id: number
  total: number
}

// Экран приложения
export type Screen = 'menu' | 'cart' | 'checkout' | 'success'