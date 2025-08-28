import { Request, Response } from 'express'
import { pool } from '../config/database'
import { orderService } from '../services/order.service'

export class MetricsController {
  async dashboard(_req: Request, res: Response) {
    // Produtos aprovados / pendentes
    const [[productRow]]: any = await pool.query(
      `SELECT 
         SUM(CASE WHEN approved = 1 THEN 1 ELSE 0 END) AS approved,
         SUM(CASE WHEN approved = 0 THEN 1 ELSE 0 END) AS pending
       FROM products`
    )

    // Usuários por papel e banidos
    const [[userRow]]: any = await pool.query(
      `SELECT 
         SUM(CASE WHEN role = 'buyer' THEN 1 ELSE 0 END) AS buyers,
         SUM(CASE WHEN role = 'seller' THEN 1 ELSE 0 END) AS sellers,
         SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins,
         SUM(CASE WHEN banned = 1 THEN 1 ELSE 0 END) AS banned
       FROM users`
    )

    // Pedidos (em memória por enquanto)
    const orders = await orderService.listAll()
    const ordersTotal = orders.length
    const revenue = orders.reduce((s, o) => s + o.total, 0)
    const byStatus = orders.reduce((acc: Record<string, number>, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {})

    res.json({
      products: { approved: Number(productRow?.approved || 0), pending: Number(productRow?.pending || 0) },
      users: {
        buyers: Number(userRow?.buyers || 0),
        sellers: Number(userRow?.sellers || 0),
        admins: Number(userRow?.admins || 0),
        banned: Number(userRow?.banned || 0),
      },
      orders: { total: ordersTotal, revenue: Number(revenue.toFixed(2)), byStatus },
    })
  }
}
