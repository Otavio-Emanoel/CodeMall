export const userService = {
  async list() {
    return [
      { id: 1, name: 'Demo User', role: 'admin' },
      { id: 2, name: 'User Two', role: 'buyer' }
    ];
  }
};
