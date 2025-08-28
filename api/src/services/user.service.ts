import { userRepository } from '../repositories/user.repository';

export const userService = {
  async list() {
    return userRepository.findAll();
  },
  async getById(id: number) {
    const u = await userRepository.findById(id);
    if (!u) return null;
    const { password_hash, ...pub } = u as any;
    return pub;
  },
  async update(id: number, data: { name?: string; email?: string; avatar?: string | null }) {
    const updated = await userRepository.update(id, data);
    const { password_hash, ...pub } = updated as any;
    return pub;
  },
  async changePassword(id: number, data: { currentPassword?: string; newPassword: string }, opts?: { force?: boolean }) {
    const u = await userRepository.findById(id);
    if (!u) throw new Error('User not found');
    if (!opts?.force) {
      // require current password to match
      if (!u.password_hash || !data.currentPassword) throw new Error('Invalid current password');
      // Lazy import to avoid cycles
      const { verifyPassword } = await import('../utils/password');
      if (!verifyPassword(data.currentPassword, u.password_hash)) throw new Error('Invalid current password');
    }
    const { hashPassword } = await import('../utils/password');
    const newHash = hashPassword(data.newPassword);
    await userRepository.updatePassword(id, newHash);
    return true;
  }
};
