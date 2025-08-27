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
  async update(id: number, data: { name?: string; email?: string }) {
    const updated = await userRepository.update(id, data);
    const { password_hash, ...pub } = updated as any;
    return pub;
  }
};
