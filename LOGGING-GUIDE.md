# Sistema de Logging Detalhado

## Visão Geral

O sistema de logging foi implementado para fornecer informações detalhadas sobre todas as requisições e erros que ocorrem na aplicação.

## Componentes

### 1. LoggerMiddleware (`src/middleware/logger.middleware.ts`)

Registra informações detalhadas sobre cada requisição HTTP:

**Logs de Entrada (Request):**
- Método HTTP e URL
- Headers relevantes (content-type, content-length, authorization mascarado)
- Body da requisição para POST/PUT/PATCH (limitado a 500 caracteres)

**Logs de Saída (Response):**
- Status code com emoji visual:
  - ✅ 2xx (sucesso)
  - ⚠️ 4xx (erro do cliente)
  - ❌ 5xx (erro do servidor)
- Tamanho da resposta
- Tempo de resposta
- IP do cliente
- Alertas para requisições lentas (>1000ms)

**Exemplo de log:**
```
[HTTP] --> POST /api/import/bulk
[HTTP]     Headers: {"content-type":"application/json","content-length":"1234"}
[HTTP]     Body: {"items":[...],"learnFromImport":true}
[HTTP] ✅ POST /api/import/bulk 200 156bytes - 45ms - ::ffff:172.18.0.1
```

### 2. AllExceptionsFilter (`src/filters/all-exceptions.filter.ts`)

Captura TODAS as exceções e loga informações detalhadas:

**Informações Registradas:**
- Caminho da requisição (método + URL)
- Status HTTP
- Mensagem de erro
- Stack trace completo
- Body da requisição (limitado a 1000 caracteres)

**Exemplo de log de erro:**
```
[ExceptionFilter] === Exception Caught ===
[ExceptionFilter] Path: POST /api/import/bulk
[ExceptionFilter] Status: 400
[ExceptionFilter] Message: "Invalid data format. Expected array of items or movimentations"
[ExceptionFilter] Error: Invalid data format
[ExceptionFilter] Stack: Error: Invalid data format...
[ExceptionFilter] Request body: {"items":[...],"learnFromImport":true}
[ExceptionFilter] ========================
```

### 3. Logs nos Controllers

Controllers críticos (como ImportController) incluem logs adicionais:
- Tipo e estrutura dos dados recebidos
- Quantidade de itens sendo processados
- Erros específicos de validação

## Como Usar

### Visualizar Logs em Tempo Real

```powershell
# Ver todos os logs
docker logs main --follow

# Ver últimas 50 linhas
docker logs main --tail 50

# Filtrar por tipo de log
docker logs main --follow | Select-String "HTTP"
docker logs main --follow | Select-String "ExceptionFilter"
docker logs main --follow | Select-String "ERROR"

# Ver logs de uma requisição específica
docker logs main | Select-String "import/bulk" -Context 5
```

### Níveis de Log Disponíveis

A aplicação está configurada com todos os níveis:
- **log**: Informações gerais
- **error**: Erros críticos
- **warn**: Avisos
- **debug**: Informações de debug (headers, bodies)
- **verbose**: Informações muito detalhadas

### Desabilitar Logs de Debug em Produção

Edite `src/main.ts` e remova 'debug' e 'verbose':

```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['log', 'error', 'warn'], // Apenas logs essenciais
});
```

## Boas Práticas

1. **Em Desenvolvimento**: Use todos os níveis de log para debugging completo
2. **Em Produção**: Limite aos níveis 'log', 'error' e 'warn'
3. **Dados Sensíveis**: O sistema já mascara tokens de authorization
4. **Performance**: Logs de requisições lentas (>1s) são automaticamente destacados

## Troubleshooting

### Problema: Logs não aparecem
```powershell
# Verificar se o container está rodando
docker ps

# Reiniciar o container
docker-compose restart main

# Ver logs de inicialização
docker logs main
```

### Problema: Muitos logs
```powershell
# Filtrar apenas erros
docker logs main --follow | Select-String "ERROR|Exception"

# Ver apenas requests HTTP
docker logs main --follow | Select-String "HTTP"
```

## Exemplos de Comandos Úteis

```powershell
# Monitorar apenas erros 4xx e 5xx
docker logs main --follow | Select-String "⚠️|❌"

# Ver requisições para uma rota específica
docker logs main | Select-String "/api/auth/login"

# Exportar logs para arquivo
docker logs main > logs.txt

# Ver tempo de resposta das requisições
docker logs main | Select-String "ms -"
```
