import { RegisterDTO, LoginDTO, AuthResult, UserRole } from './auth.types';
import { userRepository } from '../../repositories/user.repository';
import { hashPassword, verifyPassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';

export const authService = {
  async register(data: RegisterDTO): Promise<AuthResult> {
    const { name, email, password, role } = data;
    if (!['buyer', 'seller'].includes(role)) {
      throw new Error('Invalid role');
    }
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error('Email already in use');
    }
    const password_hash = hashPassword(password);
    const created = await userRepository.create({ name, email, password_hash, role: role as UserRole });
    const token = signToken({ sub: created.id, role: created.role });
    return {
      token,
      user: { id: created.id, name: created.name, email: created.email, role: created.role },
    };
  },

  async login(data: LoginDTO): Promise<AuthResult> {
    const { email, password } = data;
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
      throw new Error('Invalid credentials');
    }
    const token = signToken({ sub: user.id, role: user.role });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  },
};
