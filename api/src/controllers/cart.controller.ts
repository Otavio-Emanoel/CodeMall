import { Request, Response } from 'express'
import { cartService } from '../services/cart.service'

export class CartController {
  async list(req: Request, res: Response) {
    const userId = Number(req.query.userId)
    if (!userId) return res.status(400).json({ error: 'userId requerido' })
    const items = await cartService.list(userId)
    res.json({ items })
  }

  async add(req: Request, res: Response) {
    const userId = Number(req.body.userId || req.query.userId)
    const { productId, name, price, quantity, image, sellerId } = req.body
    if (!userId || !productId || typeof price !== 'number' || !name) {
      return res.status(400).json({ error: 'Campos obrigatórios: userId, productId, name, price' })
    }
    const items = await cartService.addItem(userId, { productId: Number(productId), name: String(name), price: Number(price), quantity: Number(quantity)||1, image: image||null, sellerId: sellerId?Number(sellerId):null })
    res.status(201).json({ items })
  }

  async update(req: Request, res: Response) {
    const userId = Number(req.body.userId || req.query.userId)
    const { productId, quantity } = req.body
    if (!userId || !productId || !quantity) return res.status(400).json({ error: 'userId, productId, quantity obrigatórios' })
    const items = await cartService.updateQuantity(userId, Number(productId), Number(quantity))
    res.json({ items })
  }

  async remove(req: Request, res: Response) {
    const userId = Number(req.body.userId || req.query.userId)
    const { productId } = req.body
    if (!userId || !productId) return res.status(400).json({ error: 'userId e productId obrigatórios' })
    const items = await cartService.removeItem(userId, Number(productId))
    res.json({ items })
  }

  async clear(req: Request, res: Response) {
    const userId = Number(req.body.userId || req.query.userId)
    if (!userId) return res.status(400).json({ error: 'userId requerido' })
    await cartService.clear(userId)
    res.json({ items: [] })
  }
}
