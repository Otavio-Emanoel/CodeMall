import { Request, Response } from 'express'
import { orderService, OrderStatus } from '../services/order.service'
import { notificationService } from '../services/notification.service'

export class OrderController {
  async create(req: Request, res: Response) {
    try {
      const { buyerId, items } = req.body
      const order = await orderService.create({ buyerId, items })

      // Notificar vendedores: nova venda
      const rawIds = (items as Array<{ sellerId: number }>).map((i) => Number(i.sellerId))
      const uniqueSet = new Set<number>(rawIds.filter((n) => Number.isFinite(n)))
      const sellerIds: number[] = Array.from(uniqueSet)
      await Promise.all(
        sellerIds.map((sid: number) =>
          notificationService.create({
            userId: sid,
            type: 'order',
            title: 'Nova venda',
            message: `Você recebeu um novo pedido ${order.id}`,
            data: { orderId: order.id },
          })
        )
      )

      res.status(201).json(order)
    } catch (e: any) {
      res.status(400).json({ error: e?.message || 'Erro ao criar pedido' })
    }
  }

  async get(req: Request, res: Response) {
    const { id } = req.params
    const order = await orderService.getById(id)
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' })
    res.json(order)
  }

  async listMine(req: Request, res: Response) {
    const { userId, role } = req.query
    const idNum = Number(userId)
    if (!userId || Number.isNaN(idNum)) return res.status(400).json({ error: 'userId inválido' })
    const roleStr = role === 'seller' ? 'seller' : 'buyer'
    const orders = await orderService.listByUser(idNum, roleStr)
    res.json(orders)
  }

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params
    const { status } = req.body as { status: OrderStatus }
    if (!['em_andamento', 'entregue', 'cancelado'].includes(status)) {
      return res.status(400).json({ error: 'status inválido' })
    }
    const updated = await orderService.updateStatus(id, status)
    if (!updated) return res.status(404).json({ error: 'Pedido não encontrado' })

    // Notificar comprador quando pedido for entregue ou cancelado
    if (status === 'entregue' || status === 'cancelado') {
      await notificationService.create({
        userId: updated.buyerId,
        type: 'order',
        title: status === 'entregue' ? 'Pedido entregue' : 'Pedido cancelado',
        message: `Seu pedido ${updated.id} foi ${status}.`,
        data: { orderId: updated.id, status },
      })
    }

    res.json(updated)
  }
}
