import { Request, Response } from 'express'
import { pool } from '../config/database'

export class AdminController {
  async banUser(req: Request, res: Response) {
    const { id } = req.params
    await pool.query('UPDATE users SET banned = 1 WHERE id = ?', [id])
    res.json({ ok: true })
  }

  async unbanUser(req: Request, res: Response) {
    const { id } = req.params
    await pool.query('UPDATE users SET banned = 0 WHERE id = ?', [id])
    res.json({ ok: true })
  }

  async approveProduct(req: Request, res: Response) {
    const { id } = req.params
    await pool.query('UPDATE products SET approved = 1 WHERE id = ?', [id])
    res.json({ ok: true })
  }

  async revokeProduct(req: Request, res: Response) {
    const { id } = req.params
    await pool.query('UPDATE products SET approved = 0 WHERE id = ?', [id])
    res.json({ ok: true })
  }
}
