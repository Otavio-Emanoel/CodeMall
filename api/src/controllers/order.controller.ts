import { Request, Response } from 'express'
import { orderService, OrderStatus } from '../services/order.service'

export class OrderController {
  async create(req: Request, res: Response) {
    try {
      const { buyerId, items } = req.body
      const order = await orderService.create({ buyerId, items })
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
    res.json(updated)
  }
}
