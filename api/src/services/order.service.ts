export type OrderStatus = 'em_andamento' | 'entregue' | 'cancelado'

export interface OrderItem {
  productId: number
  sellerId: number
  name?: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  buyerId: number
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: string
}

export interface CreateOrderInput {
  buyerId: number
  items: OrderItem[]
}

// Armazenamento em memória (placeholder). Substituir por repository + DB.
const orders: Order[] = []

function calcTotal(items: OrderItem[]): number {
  return items.reduce((sum, it) => sum + it.price * it.quantity, 0)
}

export const orderService = {
  async create(input: CreateOrderInput): Promise<Order> {
    if (!input.items?.length) throw new Error('items obrigatórios')
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const order: Order = {
      id,
      buyerId: input.buyerId,
      items: input.items,
      total: calcTotal(input.items),
      status: 'em_andamento',
      createdAt: new Date().toISOString(),
    }
    orders.push(order)
    return order
  },

  async getById(id: string): Promise<Order | undefined> {
    return orders.find((o) => o.id === id)
  },

  async listByUser(userId: number, role: 'buyer' | 'seller'): Promise<Order[]> {
    if (role === 'buyer') return orders.filter((o) => o.buyerId === userId)
    // seller: retorna pedidos que contenham itens do vendedor
    return orders.filter((o) => o.items.some((it) => it.sellerId === userId))
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    const order = orders.find((o) => o.id === id)
    if (!order) return undefined
    order.status = status
    return order
  },
}
