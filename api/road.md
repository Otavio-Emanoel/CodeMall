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
- [x] Vendedores: nova venda, avaliação
- [x] Compradores: pedido enviado, resposta de vendedor

### ❤️ Favoritos
- [x] Favoritar / desfavoritar / listar
  - `POST /api/favorites` { buyerId, targetType: 'product'|'seller', targetId }
  - `DELETE /api/favorites` { buyerId, targetType: 'product'|'seller', targetId }
  - `GET /api/favorites?buyerId=1[&targetType=product|seller]`

### 🖼️ Upload de Imagens
- [x] Vendedores podem adicionar fotos aos produtos
  - `GET /api/products/:productId/images` (público)
  - `POST /api/products/:productId/images` (Authorization: Bearer <token seller|admin do dono>)
    - multipart/form-data campo `file` (até 5MB) OU JSON `{ "filename", "url" }`
  - `DELETE /api/products/:productId/images/:imageId` (Authorization: Bearer <token seller|admin do dono>)
  - Arquivos estáticos servidos em `/uploads/*`

### 🔑 Recuperação de Senha
- [ ] Solicitar e redefinir senha via email

### 🔒 Segurança Extra
- [ ] Limitar tentativas de login
- [ ] Logs de acesso