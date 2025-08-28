import { Request, Response } from 'express'
import { favoriteRepository, FavoriteTarget } from '../repositories/favorite.repository'

export class FavoriteController {
  async add(req: Request, res: Response) {
    const { buyerId, targetType, targetId } = req.body as {
      buyerId: number
      targetType: FavoriteTarget
      targetId: number
    }
    if (!buyerId || !targetType || !targetId) return res.status(400).json({ error: 'Campos obrigatórios' })
    if (!['product', 'seller'].includes(targetType)) return res.status(400).json({ error: 'targetType inválido' })
    const fav = await favoriteRepository.add(Number(buyerId), targetType, Number(targetId))
    res.status(201).json(fav)
  }

  async remove(req: Request, res: Response) {
    const { buyerId, targetType, targetId } = req.body as {
      buyerId: number
      targetType: FavoriteTarget
      targetId: number
    }
    if (!buyerId || !targetType || !targetId) return res.status(400).json({ error: 'Campos obrigatórios' })
    if (!['product', 'seller'].includes(targetType)) return res.status(400).json({ error: 'targetType inválido' })
    await favoriteRepository.remove(Number(buyerId), targetType, Number(targetId))
    res.json({ ok: true })
  }

  async list(req: Request, res: Response) {
    const { buyerId, targetType } = req.query
    const idNum = Number(buyerId)
    if (!buyerId || Number.isNaN(idNum)) return res.status(400).json({ error: 'buyerId inválido' })
    const type = (targetType as FavoriteTarget | undefined) || undefined
    const list = await favoriteRepository.list(idNum, type)
    res.json(list)
  }
}
