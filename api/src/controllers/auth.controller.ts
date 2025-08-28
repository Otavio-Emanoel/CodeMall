import { Request, Response } from 'express'
import { authService } from '../services/auth.service'

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body)
      res.status(201).json(result)
    } catch (e: any) {
      res.status(400).json({ error: e?.message || 'Erro no cadastro' })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body)
      res.json(result)
    } catch (e: any) {
      const status = e?.status || 400
      res.status(status).json({ error: e?.message || 'Erro no login' })
    }
  }
}
