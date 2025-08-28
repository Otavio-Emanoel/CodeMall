import jwt, { SignOptions, Secret } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { userRepository } from '../repositories/user.repository'

export type Role = 'buyer' | 'seller' | 'admin'

export interface RegisterInput {
  name: string
  email: string
  password: string
  role?: Role
}

export interface LoginInput {
  email: string
  password: string
}

function signToken(payload: { sub: number; role: Role; email?: string }) {
  const secret = process.env.JWT_SECRET
  const expiresInEnv = process.env.JWT_EXPIRES_IN || '7d'
  if (!secret) throw new Error('JWT_SECRET não configurado')
  const options: SignOptions = { expiresIn: expiresInEnv as unknown as SignOptions['expiresIn'] }
  return jwt.sign(payload, secret as Secret, options)
}

export const authService = {
  async register(input: RegisterInput) {
    const name = input.name?.toString().trim()
    const email = input.email?.toLowerCase().trim()
    const password = input.password
    const role: Role = input.role || 'buyer'

    if (!name || !email || !password) {
      throw new Error('name, email e password são obrigatórios')
    }

    const exists = await userRepository.findByEmail(email)
    if (exists) {
      throw new Error('Email já cadastrado')
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await userRepository.create({ name, email, password_hash: hash, role })

    const token = signToken({ sub: user.id, role: user.role, email: user.email || undefined })
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    }
  },

  async login(input: LoginInput) {
    const email = input.email?.toLowerCase().trim()
    const password = input.password
    if (!email || !password) {
      throw new Error('email e password são obrigatórios')
    }

    const user = await userRepository.findByEmail(email)
    if (!user || !user.password_hash) {
      const err: any = new Error('Credenciais inválidas')
      err.status = 401
      throw err
    }
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      const err: any = new Error('Credenciais inválidas')
      err.status = 401
      throw err
    }

    const token = signToken({ sub: user.id, role: user.role, email: user.email || undefined })
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    }
  },
}
