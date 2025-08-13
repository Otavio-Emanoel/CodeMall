// Futuro: implementar queries reais
export const userRepository = {
  async findAll() {
    return [
      { id: 1, name: 'Demo User', role: 'admin' },
      { id: 2, name: 'User Two', role: 'buyer' }
    ];
  }
};
