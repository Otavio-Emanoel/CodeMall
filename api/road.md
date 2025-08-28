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
- [x] Criar pedidos (compradores) – `POST /api/orders`
- [x] Listar pedidos do usuário (comprador/vendedor) – `GET /api/orders/mine/list?userId=&role=buyer|seller`
- [x] Status do pedido (em andamento, entregue, cancelado) – `PATCH /api/orders/:id/status`

### ⭐ Avaliações
- [x] Compradores avaliam produtos `POST /api/reviews`
- [x] Listar avaliações `GET /api/reviews?targetType=product&targetId=101`
- [x] Resumo das avaliações (Média e contagem) `GET /api/reviews/summary?targetType=product&targetId=101`
- [x] Vendedores respondem avaliações `POST /api/reviews/{id}/reply`

### 🛡️ Administração
- [x] Rotas protegidas para admin (banir usuário, aprovar produto)
  - Requer Authorization: Bearer <token admin>
  - `POST /api/admin/users/:id/ban`
  - `POST /api/admin/users/:id/unban`
  - `POST /api/admin/products/:id/approve`
  - `POST /api/admin/products/:id/revoke`
- [x] Dashboard de métricas
  - `GET /api/metrics/dashboard` (Authorization: Bearer <token admin>)

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