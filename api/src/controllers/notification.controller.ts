import { Request, Response } from 'express'
import { notificationService } from '../services/notification.service'

export class NotificationController {
  async listMine(req: Request, res: Response) {
    const { userId } = req.query
    const idNum = Number(userId)
    if (!userId || Number.isNaN(idNum)) return res.status(400).json({ error: 'userId inválido' })
    const list = await notificationService.listByUser(idNum)
    res.json(list)
  }

  async markRead(req: Request, res: Response) {
    const { id } = req.params
    const updated = await notificationService.markRead(id)
    if (!updated) return res.status(404).json({ error: 'Notificação não encontrada' })
    res.json(updated)
  }

  async markAll(req: Request, res: Response) {
    const { userId } = req.body
    const idNum = Number(userId)
    if (!userId || Number.isNaN(idNum)) return res.status(400).json({ error: 'userId inválido' })
    const count = await notificationService.markAllRead(idNum)
    res.json({ updated: count })
  }
}
