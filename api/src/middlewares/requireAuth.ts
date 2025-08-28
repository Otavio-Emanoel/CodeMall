import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: number; role: 'buyer' | 'seller' | 'admin'; email?: string }
  }
}

interface AppJwtPayload {
  sub: number
  role: 'buyer' | 'seller' | 'admin'
  email?: string
  iat?: number
  exp?: number
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.header('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Token ausente' })

    const secret = process.env.JWT_SECRET as string
    if (!secret) return res.status(500).json({ error: 'JWT_SECRET não configurado' })

    const decodedUnknown = jwt.verify(token, secret) as unknown
    const decoded = decodedUnknown as Partial<AppJwtPayload>

    if (!decoded || typeof decoded !== 'object' || !decoded.sub || !decoded.role) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    req.user = { id: decoded.sub as number, role: decoded.role, email: decoded.email }
    return next()
  } catch (e: any) {
    const msg = e?.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido'
    return res.status(401).json({ error: msg })
  }
}
