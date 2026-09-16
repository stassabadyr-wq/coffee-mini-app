import type { Product, OrderResponse } from '../types'

// URL бэкенда. При сборке берётся из .env фронтенда.
const API_URL =
  import.meta.env.VITE_API_URL || 'https://preflight-goldsmith-thrift.ngrok-free.dev'

// Обёртка над fetch — добавляет JSON-заголовки и понятные ошибки
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!resp.ok) {
    const error = await resp.text()
    throw new Error(`API error ${resp.status}: ${error}`)
  }

  return resp.json()
}

// Получить меню (все товары или по категории)
export async function fetchProducts(category?: string): Promise<Product[]> {
  const path = category ? `/api/products?category=${category}` : '/api/products'
  return request<Product[]>(path)
}

// Создать заказ
export async function createOrder(
  initData: string,
  phone: string,
  items: { id: number; quantity: number }[],
): Promise<OrderResponse> {
  return request<OrderResponse>('/api/order', {
    method: 'POST',
    body: JSON.stringify({ init_data: initData, phone, items }),
  })
}

// Получить статус заказа
export async function fetchOrder(orderId: number) {
  return request(`/api/order/${orderId}`)
}