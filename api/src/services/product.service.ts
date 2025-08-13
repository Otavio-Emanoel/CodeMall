export const productService = {
  async list() {
    return [
      { id: 101, name: 'Plugin Analytics', type: 'addon', price: 19.9 },
      { id: 102, name: 'Tema Dark Pro', type: 'theme', price: 5.5 }
    ];
  }
};
