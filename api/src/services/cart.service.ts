export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  image?: string | null
  sellerId?: number | null
}

// In-memory storage (placeholder). Replace with DB persistence later.
const carts: Record<number, CartItem[]> = {}

function getUserCart(userId: number): CartItem[] {
  if (!carts[userId]) carts[userId] = []
  return carts[userId]
}

export const cartService = {
  async list(userId: number): Promise<CartItem[]> {
    return [...getUserCart(userId)]
  },

  async addItem(userId: number, item: { productId: number; name: string; price: number; quantity?: number; image?: string | null; sellerId?: number | null }) {
    const cart = getUserCart(userId)
    const qty = Math.max(1, item.quantity || 1)
    const existing = cart.find(c => c.productId === item.productId)
    if (existing) {
      existing.quantity += qty
    } else {
      cart.push({ productId: item.productId, name: item.name, price: item.price, quantity: qty, image: item.image || null, sellerId: item.sellerId ?? null })
    }
    return this.list(userId)
  },

  async updateQuantity(userId: number, productId: number, quantity: number) {
    const cart = getUserCart(userId)
    const q = Math.max(1, quantity)
    const existing = cart.find(c => c.productId === productId)
    if (existing) existing.quantity = q
    return this.list(userId)
  },

  async removeItem(userId: number, productId: number) {
    const cart = getUserCart(userId)
    const idx = cart.findIndex(c => c.productId === productId)
    if (idx >= 0) cart.splice(idx, 1)
    return this.list(userId)
  },

  async clear(userId: number) {
    carts[userId] = []
    return []
  },

  async setCart(userId: number, items: CartItem[]) {
    carts[userId] = []
    for (const it of items) {
      if (typeof it.productId === 'number' && typeof it.price === 'number' && typeof it.quantity === 'number') {
        carts[userId].push({
          productId: it.productId,
          name: String(it.name || ''),
          price: it.price,
          quantity: Math.max(1, it.quantity),
          image: it.image || null,
          sellerId: it.sellerId ?? null
        })
      }
    }
    return this.list(userId)
  }
}
