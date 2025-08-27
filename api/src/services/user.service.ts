import { userRepository } from '../repositories/user.repository';

export const userService = {
  async list() {
    return userRepository.findAll();
  },
};
