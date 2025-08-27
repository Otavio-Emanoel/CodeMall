import { Request, Response } from 'express'
import { reviewService, ReviewTarget } from '../services/review.service'

export class ReviewController {
  async create(req: Request, res: Response) {
    try {
      const { targetType, targetId, buyerId, rating, comment } = req.body
      const review = await reviewService.create({ targetType, targetId, buyerId, rating, comment })
      res.status(201).json(review)
    } catch (e: any) {
      res.status(400).json({ error: e?.message || 'Erro ao criar avaliação' })
    }
  }

  async list(req: Request, res: Response) {
    const { targetType, targetId } = req.query
    const tt = (targetType as ReviewTarget) || 'product'
    const id = Number(targetId)
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'targetId inválido' })
    const list = await reviewService.list(tt, id)
    res.json(list)
  }

  async summary(req: Request, res: Response) {
    const { targetType, targetId } = req.query
    const tt = (targetType as ReviewTarget) || 'product'
    const id = Number(targetId)
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'targetId inválido' })
    const s = await reviewService.summary(tt, id)
    res.json(s)
  }

  async reply(req: Request, res: Response) {
    const { id } = req.params
    const { sellerId, message } = req.body
    try {
      const updated = await reviewService.reply({ reviewId: id, sellerId, message })
      if (!updated) return res.status(404).json({ error: 'Avaliação não encontrada' })
      res.json(updated)
    } catch (e: any) {
      res.status(400).json({ error: e?.message || 'Erro ao responder avaliação' })
    }
  }
}
