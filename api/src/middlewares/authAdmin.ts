import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AppJwtPayload {
  sub: number
  role: 'buyer' | 'seller' | 'admin'
  email?: string
  iat?: number
  exp?: number
}

export function authAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.header('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Token ausente' })

    const secret = process.env.JWT_SECRET
    if (!secret) return res.status(500).json({ error: 'JWT_SECRET não configurado' })

    const decodedUnknown = jwt.verify(token, secret) as unknown
    const decoded = decodedUnknown as Partial<AppJwtPayload>

    if (!decoded || typeof decoded !== 'object' || decoded.role !== 'admin' || typeof decoded.sub !== 'number') {
      return res.status(403).json({ error: 'Acesso restrito a administradores' })
    }

    ;(req as any).user = { id: decoded.sub, role: decoded.role, email: decoded.email }

    return next()
  } catch (e: any) {
    const msg = e?.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido'
    return res.status(401).json({ error: msg })
  }
}
