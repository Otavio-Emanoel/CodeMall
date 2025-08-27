## 🗺️ Roadmap CodeMall API

### 👤 Perfil do Usuário
- [x] Visualizar dados: `GET /api/users/:id`
- [x] Editar dados: `PUT /api/users/:id`
- [x] Alterar senha

### 🛒 Produtos
- [x] CRUD de produtos (apenas vendedores)
- [x] Listagem pública de produtos
- [x] Filtros: categoria, preço, vendedor

### 📦 Pedidos/Compras
- [ ] Criar pedidos (compradores)
- [ ] Listar pedidos do usuário (comprador/vendedor)
- [ ] Status do pedido (em andamento, entregue, cancelado)

### ⭐ Avaliações
- [ ] Compradores avaliam produtos/vendedores
- [ ] Vendedores respondem avaliações

### 🛡️ Administração
- [ ] Rotas protegidas para admin (banir usuário, aprovar produto)
- [ ] Dashboard de métricas

### 🔔 Notificações
- [ ] Vendedores: nova venda, avaliação
- [ ] Compradores: pedido enviado, resposta de vendedor

### ❤️ Favoritos
- [ ] Compradores podem favoritar produtos/vendedores

### 🔑 Recuperação de Senha
- [ ] Solicitar e redefinir senha via email

### 🖼️ Upload de Imagens
- [ ] Vendedores podem adicionar fotos aos produtos

### 🔒 Segurança Extra
- [ ] Limitar tentativas de login
- [ ] Logs de acesso