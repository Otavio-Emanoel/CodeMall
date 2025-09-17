# CodeMall

Plataforma (open design em evolução) para compra e venda de códigos, plugins, temas, componentes e outros ativos digitais. Este repositório reúne:

- Frontend (Next.js 15 + React 19 + TailwindCSS) no diretório raiz
- Backend/API (Node.js + Express + TypeScript + MySQL) em `api/`

> A API ainda está em construção; há um blueprint completo em `api/readme.md` com o desenho de endpoints, camadas e roadmap detalhado.

---
## Sumário
1. [Stack & Tecnologias](#stack--tecnologias)
2. [Arquitetura do Repositório](#arquitetura-do-repositório)
3. [Pré‑requisitos](#pré-requisitos)
4. [Instalação](#instalação)
5. [Configuração de Ambiente](#configuração-de-ambiente)
6. [Execução (Dev)](#execução-dev)
7. [Build & Produção](#build--produção)
8. [Scripts Disponíveis](#scripts-disponíveis)
9. [Estrutura de Pastas (Resumo)](#estrutura-de-pastas-resumo)
10. [Fluxo de Desenvolvimento Sugerido](#fluxo-de-desenvolvimento-sugerido)
11. [Rotas / API](#rotas--api)
12. [Roadmap Alto Nível](#roadmap-alto-nível)
13. [Qualidade & Boas Práticas](#qualidade--boas-práticas)
14. [Contribuindo](#contribuindo)
15. [Licença](#licença)

---
## Stack & Tecnologias
**Frontend**
- Next.js 15 (App Router)
- React 19
- TypeScript
- TailwindCSS + Radix UI Primitives + Componentes customizados
- Zod, React Hook Form, shadcn-like pattern

**Backend (API)**
- Node.js + Express
- TypeScript
- MySQL 8 (docker) via `mysql2`
- Autenticação JWT (planejado)
- Camadas: Controllers → Services → Repositories → DB
- Segurança: Helmet, Rate limiting, CORS (já listados nas dependências)

---
## Arquitetura do Repositório
Monorepo simples (sem workspaces ainda). O frontend vive no root; a API em `api/` com seu próprio `package.json`.

```
/ (root)
  package.json        # Frontend Next.js
  app/                # Rotas e páginas (App Router)
  components/         # UI e layout
  hooks/ lib/ styles/ # Utilidades do front
  api/                # Backend (Express + TS)
    src/              # Código fonte da API
    env.example       # Variáveis de ambiente exemplo
    docker-compose.yml# Serviço MySQL
    readme.md         # Blueprint detalhado da API
```

---
## Pré-requisitos
- Node.js 20+ (recomendado LTS)
- PNPM (preferencial) ou NPM
- Docker + Docker Compose (para subir MySQL rapidamente)

Instale PNPM (se ainda não):
```powershell
npm install -g pnpm
```

Verifique versões:
```powershell
node -v
pnpm -v
```

---
## Instalação
Clone o repositório:
```powershell
git clone https://github.com/Otavio-Emanoel/CodeMall.git
cd CodeMall
```

Instalar dependências do frontend:
```powershell
pnpm install
```
(ou usando NPM)
```powershell
npm install
```

Instalar dependências da API:
```powershell
cd api
pnpm install
# (ou) npm install
cd ..
```

---
## Configuração de Ambiente
Copie o arquivo `.env` da API a partir do exemplo:
```powershell
cd api
Copy-Item env.example -Destination .env
```
Ajuste valores se necessário (senha, porta etc.). Variáveis principais:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=codemall
PORT=3333
JWT_SECRET=troque-este-valor
JWT_EXPIRES_IN=7d
```

> Para produção defina um `JWT_SECRET` forte e considere usar variáveis seguras (Vault / Secrets Manager).

### Banco de Dados (Docker Compose)
Suba o MySQL local:
```powershell
cd api
docker compose up -d
```
Verifique se o container está rodando:
```powershell
docker ps
```

(No estágio atual ainda não há migrations automatizadas / ORM configurado. Tabelas iniciais devem ser criadas manualmente ou via script futuro.)

---
## Execução (Dev)
Terminal 1 – API:
```powershell
cd api
pnpm dev
# ou: npm run dev
```
A API deverá iniciar em `http://localhost:3333` (ajustável via `.env`).

Terminal 2 – Frontend:
```powershell
pnpm dev
# ou: npm run dev
```
Frontend em: `http://localhost:3000`

---
## Build & Produção
Frontend (gera `.next`):
```powershell
pnpm build
pnpm start
```
API (gera `dist/`):
```powershell
cd api
pnpm build
pnpm start
```
> Para produção considere: PM2 / Dockerfile próprio, logging estruturado, reverse proxy (NGINX/Caddy) e HTTPS.

---
## Scripts Disponíveis
Frontend (`package.json` raiz):
- `pnpm dev` – modo desenvolvimento
- `pnpm build` – build de produção
- `pnpm start` – serve build
- `pnpm lint` – lint Next/ESLint (caso configurado futuramente)

API (`api/package.json`):
- `pnpm dev` – watch (`ts-node-dev`)
- `pnpm build` – compila TypeScript para `dist/`
- `pnpm start` – executa código compilado
- `pnpm lint` / `pnpm lint:fix` – qualidade
- `pnpm format` – formata com Prettier

> O script `test` atualmente é placeholder.

---
## Estrutura de Pastas (Resumo)
### Frontend
- `app/` – rotas Next.js (App Router)
- `components/` – componentes UI (baseados em Radix + estilização Tailwind)
- `hooks/` – hooks customizados (ex: carrinho, toast)
- `lib/` – utilidades (ex: helpers de formatação)
- `styles/` – estilos globais

### Backend
- `src/server.ts` – ponto de entrada HTTP
- `src/app.ts` – configuração do Express (middlewares, rotas)
- `controllers/` – lógica fina HTTP (parse/validação entrada + resposta)
- `services/` – regra de negócio
- `repositories/` – acesso a dados (MySQL)
- `middlewares/` – autenticação, rate limit etc.
- `utils/` – helpers e utilidades
- `uploads/` – armazenamento local (dev) de arquivos enviados

---
## Fluxo de Desenvolvimento Sugerido
1. Atualizar/alinhar blueprint de endpoints se algo mudar (`api/readme.md`).
2. Implementar/ajustar camada de repositório para entidade alvo.
3. Implementar serviço correspondente (regras, validações de negócio).
4. Criar controller + rotas.
5. Adicionar validação de entrada (planejado: Zod / Joi) e testes (futuro).
6. Integrar no frontend (fetch/axios, SWR/React Query opcional futuro).
7. Revisar logs e tratar erros (middleware de erro centralizado – pendente).

---
## Rotas / API
O detalhamento completo (tabelas, convenções de resposta, roadmap técnico, status HTTP e design de erros) está em: `api/readme.md`.

Principais grupos: Auth, Users, Apps, Products, Categories/Tags, Search, Cart, Checkout/Payments, Orders, Licenses, Reviews, Wishlist, Notifications, Admin, Analytics, Uploads.

---
## Roadmap Alto Nível
- [ ] Base de erros e middleware global
- [ ] Auth (JWT + refresh + roles)
- [ ] CRUD Apps + publicação
- [ ] Produtos / Categorias / Tags
- [ ] Carrinho + Checkout + Orders + Licenças
- [ ] Reviews + Wishlist + Notificações
- [ ] Uploads (S3 ou local) + Assets
- [ ] Admin + Analytics + Webhooks
- [ ] Hardening: Rate limit, Logger estruturado, Cache Redis
- [ ] Documentação OpenAPI + CI/CD
- [ ] Futuro: Tickets, Sessões Ativas, Feature Flags

(Ver lista completa e ordenada em `api/readme.md`.)

---
## Qualidade & Boas Práticas
- Tipagem rigorosa (TypeScript strict — verificar se ativado no `tsconfig`)
- Validar input nas bordas (controllers) antes de chamar services
- Evitar lógica de negócio em controllers
- Erros: usar classes customizadas (ex: `DomainError`) e mapear para HTTP
- Paginação consistente e contratos de resposta padronizados
- Logs estruturados (sugestão futura: Pino ou Winston)

### Padrão de Commit (Sugestão)
```
feat: nova funcionalidade
fix: correção de bug
chore: manutenção geral
refactor: refatoração sem alterar comportamento
docs: somente documentação
style: formatação (semântica inalterada)
test: testes
perf: melhorias de performance
build: ajustes de build
ci: ajustes de pipeline
```

---
## Contribuindo
1. Abra issue descrevendo a mudança
2. Crie branch: `feat/nome-da-feature` ou `fix/descrição-curta`
3. Commits claros seguindo convenção
4. Abra Pull Request referenciando a issue
5. Aguarde review / ajustes

> Dúvidas sobre escopo? Consulte o blueprint antes de implementar.

---
## Licença
Projeto sob licença **ISC** (conforme `api/package.json`). Ajuste este trecho se a licença global mudar.

---
## FAQ Rápida
**Posso usar npm em vez de pnpm?** Sim, todos os scripts funcionam igualmente; apenas o lockfile (`pnpm-lock.yaml`) muda se usar outro gestor.

**Onde adiciono novas rotas?** Na API, criando controller + rota em `src/routes` (ou conforme padrão que vier a ser adicionado) e expondo no `app.ts`.

**Já existe ORM?** Ainda não. Está planejada adoção de Prisma ou Knex (futuro).

**Como tratar uploads em produção?** Recomenda-se mover de disco local (`uploads/`) para S3/Cloud Storage e gerar URLs temporárias.

---
## Próximos Passos Técnicos (Sugestão)
- Definir ORM + migrations iniciais (users, apps, products, orders)
- Implementar camada de erros + logger
- Autenticação completa (login/register/me/refresh/logout)
- Primeiros endpoints consumidos pelo frontend (lista de apps, detalhes)
- Deploy inicial (Railway, Render, Fly.io ou VPS) + CDN de assets

---

> Feedbacks, ideias e PRs são bem-vindos. Bom código! 🚀
