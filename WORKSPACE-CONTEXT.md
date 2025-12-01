# 📋 Contexto do Projeto Movimentation - Workspace Completo

Sou desenvolvedor trabalhando em um projeto full-stack chamado **Movimentation** (BrenoWii/projectModelCanvas). Este é um workspace com **DOIS PROJETOS**:

## 🏗️ Estrutura do Workspace
```
movimentation-workspace/
├── movimentation-back/    (NestJS v7 + TypeORM + PostgreSQL)
└── movimentation-front/   (Vue 3 ou React - especificar)
```

## 🔧 Stack Tecnológico

### Backend
- **Framework:** NestJS v7 com decorators, guards, middleware, exception filters
- **Banco de Dados:** PostgreSQL 15-alpine (em container com volume persistente)
- **ORM:** TypeORM com relacionamentos (Classification → PlanOfBill, Movimentation → User)
- **Autenticação:** JWT com Passport + JwtAuthGuard
- **Docker:** Multi-stage Dockerfile, docker-compose.yml
- **Package Manager:** Yarn (não usar npm)
- **Testes:** Jest com 55 testes passando (11 suites)
- **Git Hooks:** Husky pre-commit (roda testes automaticamente)

### Frontend
- **Framework:** Quasar (Vue 3)
- **CORS:** Conecta de localhost:8080 ou IP Tailscale 100.113.154.3:8080
- **Autenticação:** JWT via `Authorization: Bearer <token>` header
- **Data:** Recebe/envia valores em centavos (não reais)
- **Testes:** Vitest com 24 testes (15 falhando, 9 passando)
- **Package Manager:** Yarn 1.22.21
- **Node Version:** 20.11.0

## 📊 Recursos Principais da API

### Import (`/api/import`)
**Formato de entrada (padrão moderno):**
```json
{
  "items": [
    {
      "date": "2025-11-30",
      "value": 10000,
      "description": "PAGAMENTO PIX",
      "classificationId": 5,
      "payDate": "2025-12-05",
      "paymentMethod": "PIX"
    }
  ],
  "learnFromImport": true
}
```

**Análise CSV:** Suporta formato padrão (date, description, value) e Nubank (Data, Valor, Descrição)

### Movimentations (`/api/movimentations`)
**Response:**
```json
{
  "movimentations": [
    {
      "id": 1,
      "date": "2025-11-30",
      "value": 10000,
      "description": "PAGAMENTO PIX",
      "classification": { "id": 5, "description": "Compras" },
      "planOfBill": { "id": 1, "description": "Custos Fixos" },
      "user": { "id": 1, "firstName": "Breno", "lastName": "Oliveira", "email": "..." }
    }
  ],
  "summary": {
    "byClassification": [
      { "classificationId": 5, "total": 150000 }
    ],
    "byPlanOfBills": [
      { "planOfBillId": 1, "total": 150000 }
    ]
  }
}
```

**Filtros suportados:**
- `dateFrom`, `dateTo` - período
- `payDateFrom`, `payDateTo` - data de pagamento
- `valueMin`, `valueMax` - intervalo de valor
- `classificationId` - filtro por classificação

### Outros Endpoints
- `/api/classification` - CRUD de classificações
- `/api/plan-of-bills` - Planos de conta
- `/api/users` - Gerenciamento de usuários

## 🔐 Segurança & Configuração

### Credenciais (Não Versionadas)
- `.env` com valores reais:
  - `JWT_SECRET_KEY` - chave secreta JWT
  - `DB_PASSWORD` - senha do PostgreSQL
  - `DB_HOST`, `DB_DATABASE`, `DB_USER`
- **Status:** ✅ Em `.gitignore`, não rastreado por Git

### CORS
```typescript
cors: {
  origin: ['http://localhost:8080', 'http://100.113.154.3:8080'],
  credentials: true
}
```

### Logging
- **Middleware:** LoggerMiddleware (logs HTTP com emojis ✅⚠️❌)
- **Exception Filter:** AllExceptionsFilter global (stack traces completos)
- **Auth Headers:** Mascarados nos logs (não exibe token)

### Vulnerabilidades (npm audit)
**Frontend:**
- Total: 57 vulnerabilidades
- Críticas: 2 (Babel em @quasar/app)
- High: 23
- Moderate: 23
- Low: 9
- ✅ Axios atualizado para ^1.6.0
- ✅ Testes: 24/24 passando após atualização

**Backend:**
- Total: 55 vulnerabilidades  
- Críticas: 4
- High: 23
- Moderate: 21
- Low: 7
- ✅ Testes: 55/55 passando
- ⚠️ Dependências legadas de @nestjs/cli e @quasar/app contribuem com a maioria

## 🐳 Docker & Ambiente Local

### Requisitos Windows/OneDrive
**BuildKit DEVE estar desabilitado:**
```powershell
$env:DOCKER_BUILDKIT=0
docker-compose up -d --build
```

### Containers
```yaml
main:
  - Porta: 3000 (http://localhost:3000)
  - Watch mode: yarn start:dev
  - Status: Always running unless stopped

postgres:
  - Porta: 5432
  - Volume: movimentation-back_pgdata (persistente)
  - Health check: Enabled
```

### Scripts PowerShell Disponíveis
| Script | Função |
|--------|--------|
| `backup-database.ps1` | Cria dump SQL com timestamp |
| `restore-database.ps1` | Restaura de arquivo |
| `clean-volumes.ps1` | Limpa volumes (requer dupla confirmação) |
| `start-all.ps1` | Inicia todos os containers |
| `stop-all.ps1` | Para todos os containers |
| `setup-database.ps1` | Configura usuário PostgreSQL |
| `setup-autostart.ps1` | Configurar inicialização automática |

## 📝 Padrões & Convenções

### DTOs
- **Import:** `BulkCreateDto` com `items` (não `movimentations`)
- **Internal:** `BulkInternalItemDto` (com `originalDescription`, `learnMapping`)
- **Validação:** class-validator decorators

### Valores & Datas
- **Valores:** Em centavos (multiplica por 100)
  - Frontend: 150 reais → Backend: 15000 centavos
- **Datas:** ISO 8601 (YYYY-MM-DD)
  - Normaliza timezone para local
  - Remove `T00:00:00Z` automaticamente

### Responses
- **Sanitização:** User sem password nas respostas
- **Summary:** Math.abs() para valores negativos
- **Relacionamentos:** Carregados com `leftJoinAndSelect`

### Testes
- **Framework:** Jest
- **Cobertura:** 55 testes, 11 suites
- **Mocks:** TypeORM repositories, services
- **Padrão:** `describe` + `it` + `expect`
- **Execução:** `yarn test` (ou `yarn test:watch`)

### Git Workflow
- **Hook:** Pre-commit roda `yarn test` automaticamente
- **Commits:** Bloqueados se testes falharem
- **Mensagens:** Format: `feat:`, `fix:`, `test:`, `chore:`

## 🚀 Estado Atual do Projeto

### ✅ Concluído
- Docker + PostgreSQL funcionando
- Backend rodando em http://localhost:3000
- Todos os 55 testes passando (backend)
- CORS configurado para frontend
- Logger middleware + Exception filter
- Import endpoint standardizado
- Movimentations com summary aggregations
- Database backup system
- Husky pre-commit hooks
- Segurança validada (.env não versionado)
- Frontend rodando em http://localhost:8080
- Yarn configurado e dependências instaladas

### 📊 Frontend - Status de Testes
- **Total:** 24 testes
- **✅ Passando:** 24/24 (100%)
- **Status:** ✅ TODOS OS TESTES PASSANDO
  - Currency formatting (9 testes) ✓
  - Router guards (6 testes) ✓
  - Authentication store (4 testes) ✓
  - Movimentation store (5 testes) ✓

### 📋 Próximos Passos
- [x] Instalar Vitest e dependências de teste
- [x] Corrigir 24 testes do frontend (100% passando)
- [x] Atualizar dependências vulneráveis (axios ^1.6.0)
- [x] Validar testes após atualizações
- [ ] Commitar alterações finais
- [ ] Integração completa frontend + backend
- [ ] Testes E2E (Cypress/Playwright)
- [ ] Deploy para staging
- [ ] Deploy para produção

## 📊 Resumo de Vulnerabilidades Corrigidas
**Ações Tomadas:**
1. ✅ Atualizado `axios` de ^0.18.1 para ^1.6.0 (corrige SSRF, CSRF, DoS)
2. ✅ Identificadas vulnerabilidades herdadas de @quasar/app e @nestjs/cli
3. ✅ Todos os testes continuam passando (Frontend 24/24, Backend 55/55)
4. ✅ Documentadas vulnerabilidades ativas e seus níveis de severidade

**Vulnerabilidades Remanescentes:**
- Principalmente herdadas de dependências legadas (@quasar/app@2.0.0, @nestjs/cli@7.x)
- Requerem upgrade major de frameworks (Quasar v2→v3, NestJS v7→v10+)
- Baixo risco para ambiente local de desenvolvimento
- Recomendado upgrade futuro para produção

## 💡 Dicas Importantes

1. **Sempre usar Yarn:** `yarn test`, `yarn start:dev`, `yarn build`
2. **Git como referência:** `git ls-files`, `git status`, `git diff --cached`
3. **BuildKit:** Lembrar de desabilitar em Windows: `$env:DOCKER_BUILDKIT=0`
4. **Testes:** Rodam automaticamente no commit via Husky
5. **Valores:** Backend sempre em centavos, frontend em reais
6. **Async/Await:** Todos os controllers/services async
7. **Relations:** Usar `leftJoinAndSelect` no TypeORM para evitar N+1

## 🔗 Repositório
- **Owner:** BrenoWii
- **Repo:** projectModelCanvas
- **Branch:** master
- **URL:** https://github.com/BrenoWii/projectModelCanvas

---

**Última Atualização:** 30 de Novembro de 2025

**Ao iniciar novo chat com este workspace, mencione:**
> "Estou usando Yarn, tenho Docker rodando localmente, 55 testes passando, backend em http://localhost:3000, workspace com frontend + backend"
