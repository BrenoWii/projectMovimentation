# 🔒 Sistema de Backup e Restore do Banco de Dados

## ⚠️ COMANDOS PERIGOSOS - EVITE PERDA DE DADOS

### 🚫 NUNCA execute estes comandos sem fazer backup antes:

```powershell
# PERIGO: Remove volumes e APAGA TODOS OS DADOS!
docker-compose down -v

# PERIGO: Remove todos os volumes Docker
docker volume prune -f

# PERIGO: Remove container e dados do postgres
docker rm -v postgres
```

## ✅ Fazer Backup do Banco

**SEMPRE faça backup antes de:**
- Executar `docker-compose down -v`
- Atualizar versão do PostgreSQL
- Fazer mudanças grandes no schema
- Limpar volumes Docker

```powershell
# Criar backup
.\backup-database.ps1
```

Os backups são salvos na pasta `backups/` com nome `fluxodecaixa_YYYY-MM-DD_HH-mm-ss.sql`

## 🔄 Restaurar Backup

### Opção 1: Escolher da lista interativa
```powershell
.\restore-database.ps1
```

### Opção 2: Especificar arquivo
```powershell
.\restore-database.ps1 .\backups\fluxodecaixa_2025-11-30_15-30-00.sql
```

## 📋 Rotina Recomendada

### Backup Diário (Manual)
```powershell
.\backup-database.ps1
```

### Backup Antes de Mudanças
```powershell
# 1. Fazer backup
.\backup-database.ps1

# 2. Fazer as mudanças
docker-compose down -v
docker-compose up -d

# 3. Se algo der errado, restaurar
.\restore-database.ps1
```

## 🔧 Comandos Seguros

### Reiniciar sem perder dados
```powershell
docker-compose restart
# ou
docker-compose down
docker-compose up -d
```

### Parar tudo e manter dados
```powershell
docker-compose down
# (SEM o -v)
```

### Ver logs
```powershell
docker-compose logs -f
docker logs postgres
docker logs main
```

## 📊 Verificar Tamanho do Banco

```powershell
docker exec postgres psql -U postgres -d fluxodecaixa -c "\dt+"
docker exec postgres psql -U postgres -d fluxodecaixa -c "SELECT pg_size_pretty(pg_database_size('fluxodecaixa'));"
```

## 🆘 Recuperação de Emergência

### Se apagou os dados acidentalmente:

1. **NÃO execute mais comandos Docker**
2. **Verifique se tem backup:**
   ```powershell
   Get-ChildItem .\backups\*.sql | Sort-Object LastWriteTime -Descending
   ```
3. **Restaure o backup mais recente:**
   ```powershell
   .\restore-database.ps1
   ```

### Se não tem backup e o volume ainda existe:

```powershell
# Listar volumes
docker volume ls

# Se o volume pgdata existe, NÃO REMOVA
# Inicie o container novamente
docker-compose up -d postgres
```

## 💾 Backup Automático (Opcional)

### Criar tarefa agendada no Windows:

```powershell
# Executar como Administrador
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\Users\Breno\OneDrive\Documentos\Projetos\nestjs\movimentation-back\backup-database.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive
Register-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -TaskName "Backup Fluxo de Caixa" -Description "Backup diario do banco de dados"
```

## 🎯 Resumo

| Comando | Seguro? | Descrição |
|---------|---------|-----------|
| `docker-compose restart` | ✅ SIM | Reinicia containers mantendo dados |
| `docker-compose down` | ✅ SIM | Para containers mantendo dados |
| `docker-compose down -v` | ❌ NÃO | **APAGA DADOS!** Fazer backup antes |
| `docker volume prune` | ❌ NÃO | **APAGA VOLUMES!** Fazer backup antes |
| `.\backup-database.ps1` | ✅ SIM | Cria backup seguro |
| `.\restore-database.ps1` | ⚠️ CUIDADO | Sobrescreve dados atuais |

## 📁 Estrutura de Backups

```
backups/
├── fluxodecaixa_2025-11-30_10-00-00.sql
├── fluxodecaixa_2025-11-30_15-30-00.sql
└── fluxodecaixa_2025-11-30_20-45-00.sql
```

**Dica:** Mantenha pelo menos os últimos 7 dias de backups.
