## CodeMall API

Backend (Node.js + TypeScript + Express) para o marketplace de aplicativos CodeMall.

Este documento descreve TODAS as funcionalidades planejadas e o design de rotas/endpoints para orientar a implementação incremental.

---
## Visão Geral das Camadas
- controllers: recebem requisição, validam input e chamam serviços
- services: regras de negócio / orquestração
- repositories: acesso ao banco (MySQL) / cache
- middlewares: auth, rate-limit, validação, auditoria
- utils/shared: helpers, DTOs, tipos, erros customizados

---
## Funcionalidades (Macro)
1. Autenticação & Autorização (JWT + Refresh Tokens + Roles/Permissions)
2. Gestão de Usuários (perfil, avatar, preferências)
3. Gestão de Aplicativos (CRUD apps, versões, status de publicação)
4. Produtos / Itens (plugins, temas, add-ons)
5. Categorias & Tags (organização e descoberta)
6. Busca (full-text + filtros + ordenação)
7. Carrinho de Compras
8. Checkout & Pagamentos (integração gateway – simulado inicialmente)
9. Pedidos / Orders (histórico, status, faturas)
10. Licenciamento / Downloads (controle de acesso pós-compra)
11. Avaliações & Reviews (rating, comentários, denúncias)
12. Favoritos / Wishlist
13. Notificações (in-app + e-mail futuro)
14. Webhooks (eventos para terceiros / integrações futuras)
15. Analytics Básico (downloads, vendas, receita por app)
16. Administração (moderação, métricas, bloquear usuários, aprovar apps)
17. Logs & Auditoria (ações relevantes)
18. Monitoramento & Health (health, metrics, readiness, versão)
19. Upload de Arquivos (logo do app, screenshots, bundle)
20. Segurança (rate limiting, CORS, sanitização, validação, CSRF para painel web se necessário)
21. Internacionalização / Localização (metadata multi-idioma futura)
22. Suporte & Tickets (canal de suporte entre comprador e vendedor – futuro)
23. Sessões & Dispositivos (revogar tokens, listar sessões ativas – futuro)
24. Feature Flags (habilitar/desabilitar features em tempo de execução – futuro)

---
## Convenções de Design
- Base Path: `/api` (ex: `/api/users`)
- Versionamento futuro: `/api/v1/...`
- Respostas JSON sempre com chaves previsíveis
	- Sucesso (lista): `{ data: [...], pagination?: { page, perPage, total } }`
	- Sucesso (item): `{ data: { ... } }`
	- Erro: `{ error: { code, message, details? } }`
- IDs numéricos internos, possivelmente ULIDs/UUIDs futuramente para público
- Datas em ISO 8601 UTC
- Paginação: `?page=1&perPage=20`
- Ordenação: `?sort=field,-otherField`
- Filtros: `?status=active&category=devops`

---
## Estrutura Principal de Rotas

### 0. Infra
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Status rápido |
| GET | `/api/ping` | Latência básica |
| GET | `/api/metrics` | (futuro) métricas Prometheus |
| GET | `/api/version` | Versão da API |

### 1. Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Criar conta usuário padrão |
| POST | `/api/auth/login` | Login e emissão de tokens |
| POST | `/api/auth/refresh` | Renovar access token |
| POST | `/api/auth/logout` | Revogar refresh token atual |
| POST | `/api/auth/forgot-password` | Solicitar recuperação |
| POST | `/api/auth/reset-password` | Redefinir senha |
| GET | `/api/auth/me` | Dados do usuário autenticado |

### 2. Usuários
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/users` | Listar usuários (admin) |
| GET | `/api/users/:id` | Detalhar usuário |
| PATCH | `/api/users/:id` | Atualizar perfil |
| DELETE | `/api/users/:id` | Desativar / apagar (soft delete) |
| GET | `/api/users/:id/apps` | Apps publicados por usuário |
| GET | `/api/users/:id/reviews` | Reviews feitos pelo usuário |

### 3. Apps (Marketplace principal)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/apps` | Listar apps (filtros, busca) |
| POST | `/api/apps` | Criar app (publisher) |
| GET | `/api/apps/:id` | Detalhar app |
| PATCH | `/api/apps/:id` | Atualizar metadados |
| DELETE | `/api/apps/:id` | Remover / arquivar |
| POST | `/api/apps/:id/publish` | Solicitar publicação |
| POST | `/api/apps/:id/unpublish` | Despublicar |
| GET | `/api/apps/:id/versions` | Listar versões |
| POST | `/api/apps/:id/versions` | Criar nova versão |
| GET | `/api/apps/:id/versions/:versionId` | Detalhe versão |
| POST | `/api/apps/:id/assets` | Upload de assets (logo, screenshots) |

### 4. Produtos (Plugins / Temas / Add-ons)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/products` | Listar produtos |
| POST | `/api/products` | Criar produto |
| GET | `/api/products/:id` | Detalhar produto |
| PATCH | `/api/products/:id` | Atualizar |
| DELETE | `/api/products/:id` | Remover |

### 5. Categorias & Tags
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/categories` | Listar categorias |
| POST | `/api/categories` | Criar categoria (admin) |
| GET | `/api/categories/:id` | Detalhar |
| PATCH | `/api/categories/:id` | Atualizar |
| DELETE | `/api/categories/:id` | Remover |
| GET | `/api/tags` | Listar tags |
| POST | `/api/tags` | Criar tag |
| DELETE | `/api/tags/:id` | Remover tag |

### 6. Busca
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/search` | Busca unificada (`q`, filtros) |

### 7. Carrinho
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/cart` | Obter carrinho atual |
| POST | `/api/cart/items` | Adicionar item |
| PATCH | `/api/cart/items/:itemId` | Alterar quantidade |
| DELETE | `/api/cart/items/:itemId` | Remover item |
| DELETE | `/api/cart` | Esvaziar carrinho |

### 8. Checkout & Pagamento
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/checkout` | Iniciar checkout |
| POST | `/api/payments` | Criar intenção de pagamento |
| GET | `/api/payments/:id` | Status pagamento |
| POST | `/api/payments/:id/capture` | Capturar (se gateway exigir) |

### 9. Pedidos / Orders
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/orders` | Listar pedidos (do usuário) |
| GET | `/api/orders/:id` | Detalhar pedido |
| POST | `/api/orders/:id/refund` | Solicitar reembolso |

### 10. Licenças / Downloads
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/licenses` | Listar licenças do usuário |
| GET | `/api/licenses/:id` | Detalhe licença |
| GET | `/api/licenses/:id/download` | Baixar pacote (link temporário) |

### 11. Reviews & Rating
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/apps/:id/reviews` | Listar reviews de um app |
| POST | `/api/apps/:id/reviews` | Criar review |
| PATCH | `/api/reviews/:id` | Editar review |
| DELETE | `/api/reviews/:id` | Remover review |
| POST | `/api/reviews/:id/report` | Reportar review |

### 12. Favoritos / Wishlist
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/wishlist` | Listar favoritos |
| POST | `/api/wishlist/:appId` | Adicionar |
| DELETE | `/api/wishlist/:appId` | Remover |

### 13. Notificações
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/notifications` | Listar notificações |
| PATCH | `/api/notifications/:id/read` | Marcar como lida |
| PATCH | `/api/notifications/read-all` | Marcar todas |

### 14. Webhooks (Admin / Parceiros)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/webhooks` | Listar endpoints configurados |
| POST | `/api/webhooks` | Registrar endpoint |
| DELETE | `/api/webhooks/:id` | Remover endpoint |
| POST | `/api/webhooks/test` | Disparar teste |

### 15. Analytics
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/analytics/overview` | Métricas gerais |
| GET | `/api/analytics/apps/:id` | Métricas por app |
| GET | `/api/analytics/sales` | Receita/volume |

### 16. Admin
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/apps/pending` | Apps aguardando aprovação |
| POST | `/api/admin/apps/:id/approve` | Aprovar app |
| POST | `/api/admin/apps/:id/reject` | Rejeitar app |
| GET | `/api/admin/users` | Listar usuários |
| PATCH | `/api/admin/users/:id/role` | Alterar papel |
| POST | `/api/admin/users/:id/ban` | Banir usuário |

### 17. Uploads / Assets
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/uploads` | Upload genérico (retorna URL) |
| POST | `/api/apps/:id/assets` | Upload asset específico do app |

### 18. Suporte / Tickets (Futuro)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/tickets` | Listar tickets do usuário |
| POST | `/api/tickets` | Abrir ticket |
| GET | `/api/tickets/:id` | Detalhar |
| POST | `/api/tickets/:id/messages` | Nova mensagem |

### 19. Sessões / Dispositivos (Futuro)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/sessions` | Listar sessões ativas |
| DELETE | `/api/sessions/:id` | Revogar sessão |

### 20. Feature Flags (Futuro)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/flags` | Listar flags |
| PATCH | `/api/flags/:key` | Alterar valor |

---
## Erros & Códigos de Status
- 200/201: sucesso
- 204: sem conteúdo (deleções)
- 400: validação
- 401: não autenticado
- 403: sem permissão
- 404: não encontrado
- 409: conflito (ex: app já publicado)
- 422: semântico (ex: estado inválido para operação)
- 429: rate limit
- 500: erro interno

Formato de erro:
```json
{
	"error": {
		"code": "USER_NOT_FOUND",
		"message": "Usuário não encontrado",
		"details": { "id": 999 }
	}
}
```

---
## Roadmap de Implementação (Sugestão de Ordem)
1. Base (health, ping, estrutura, logs, error handler)
2. Auth + Users (login, register, me)
3. Apps CRUD + publicação
4. Produtos / Categorias / Tags
5. Busca + filtros
6. Carrinho + Checkout + Orders + Licenças
7. Reviews + Wishlist + Notificações
8. Uploads + Assets
9. Admin + Analytics
10. Webhooks + Hardening (rate limit, cache)
11. Futuro: Tickets, Sessões, Feature Flags

---
## TODO Técnico
- [ ] Implementar middleware global de erro
- [ ] Adicionar validação (zod ou joi)
- [ ] JWT + refresh + roles
- [ ] Repositórios MySQL (migrations via Prisma ou Knex)
- [ ] Cache (Redis) para buscas populares
- [ ] Rate limiting (ex: express-rate-limit ou próprio)
- [ ] Logger estruturado (pino/winston)
- [ ] Uploads (S3 ou disco local dev)
- [ ] Testes (unit + integração) Jest / Vitest
- [ ] Dockerfile + docker-compose (mysql + redis)
- [ ] CI (lint, test, build)
- [ ] Documentação OpenAPI/Swagger
- [ ] Versionamento v1 -> v2 futuro

---
## Exemplo de Resposta Paginada
```json
{
	"data": [ { "id": 1, "name": "Exemplo App" } ],
	"pagination": {
		"page": 1,
		"perPage": 20,
		"total": 120
	}
}
```

---
## Segurança (Planejado)
- Sanitização de input
- Helmet (headers segurança)
- Limite de payload JSON
- Rate limiting por IP + chave de API opcional
- Logs de auditoria para ações críticas
- Verificação de integridade de arquivos enviados

---
## Licenciamento & Distribuição
Cada compra gera licença (chave) que controla acesso a download/atualizações de versões privadas.

---
## Notas
Este README serve como blueprint; endpoints podem ser ajustados conforme evolução.
