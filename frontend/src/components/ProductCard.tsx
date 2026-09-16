import type { Product } from '../types'

interface ProductCardProps {
  product: Product
  quantity: number
  onAdd: (product: Product) => void
  onRemove: (productId: number) => void
}

export function ProductCard({ product, quantity, onAdd, onRemove }: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-emoji">{product.emoji}</div>

      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-desc">{product.description}</div>
        <div className="product-price">{product.price} ₽</div>
      </div>

      {quantity === 0 ? (
        <button className="product-add" onClick={() => onAdd(product)}>
          +
        </button>
      ) : (
        <div className="product-counter">
          <button onClick={() => onRemove(product.id)}>−</button>
          <span>{quantity}</span>
          <button onClick={() => onAdd(product)}>+</button>
        </div>
      )}
    </div>
  )
}