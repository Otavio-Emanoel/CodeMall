# Checklist de Incrementos CodeMall (Frontend & Backend)

## 🖥️ Frontend: Telas e Funcionalidades

### Telas que faltam implementar
- [x] Página de cadastro/login (autenticação)
- [x] Página de recuperação de senha
- [x] Página de perfil do vendedor (produtos, avaliações, vendas)
- [x] Página de detalhes do pedido (status, rastreio, histórico)
- [ ] Página de favoritos (produtos/sellers)
- [ ] Página de notificações (listagem, marcar como lida)
- [ ] Página de administração (dashboard, banir/autorizar usuários/produtos)
- [ ] Página de upload/gerenciamento de imagens do produto
- [ ] Página de avaliações do produto (com formulário de avaliação e resposta do vendedor)
- [ ] Página de checkout (finalizar compra, endereço, pagamento)
- [ ] Página de listagem de pedidos do usuário (comprador/vendedor)
- [ ] Página de produtos do vendedor (CRUD)
- [ ] Página de busca/filtragem avançada de produtos
- [ ] Página de erro 404/500 customizada

### Funcionalidades do frontend
- [ ] Integração com endpoints de autenticação (login, register, /me)
- [ ] Persistência do token JWT (localStorage/cookie)
- [ ] Proteção de rotas (redirecionar se não autenticado/admin)
- [ ] Upload de imagens via multipart/form-data
- [ ] Adicionar/remover favoritos (chamar API)
- [ ] Listar e marcar notificações como lidas
- [ ] Adicionar avaliações e respostas
- [ ] Adicionar/remover produtos do carrinho
- [ ] Finalizar pedido (checkout)
- [ ] Exibir status do pedido e histórico
- [ ] Exibir métricas/admin dashboard
- [ ] Exibir avaliações agregadas (média, contagem)
- [ ] Exibir lista de produtos favoritos
- [ ] Exibir lista de sellers favoritos
- [ ] Exibir lista de pedidos do usuário
- [ ] Exibir lista de pedidos do vendedor
- [ ] Exibir lista de notificações
- [ ] Exibir lista de imagens do produto
- [ ] Exibir lista de avaliações do produto

## 🛠️ Backend: Endpoints e Funcionalidades
- [ ] Persistir pedidos, avaliações e notificações no banco (atualmente in-memory)
- [ ] Endpoint de recuperação de senha (solicitar e redefinir)
- [ ] Endpoint de upload de imagens (já implementado, testar integração)
- [ ] Endpoint de busca/filtragem avançada de produtos
- [ ] Endpoint de listagem de pedidos do vendedor
- [ ] Endpoint de listagem de favoritos (produtos/sellers)
- [ ] Endpoint de listagem de notificações
- [ ] Endpoint de métricas/admin dashboard
- [ ] Endpoint de avaliações agregadas (média, contagem)
- [ ] Endpoint de resposta do vendedor à avaliação
- [ ] Endpoint de status do pedido (atualizar, rastrear)
- [ ] Endpoint de banimento/aprovação de usuários/produtos
- [ ] Endpoint de upload/remover imagens do produto
- [ ] Endpoint de erro customizado (404/500)
- [ ] Endpoint de logs de acesso/segurança
- [ ] Limitar tentativas de login
- [ ] WebSocket/SSE para notificações em tempo real

## 📝 Observações
- Priorize telas de autenticação, favoritos, pedidos, avaliações e notificações para MVP.
- Teste todos endpoints com Thunder Client antes de integrar.
- Garanta persistência no backend antes de liberar funcionalidades críticas no front.
- Use o roadmap do backend para acompanhar o progresso dos endpoints.
