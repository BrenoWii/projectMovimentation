# 🛠️ Scripts de Automação e Gerenciamento

Esta pasta contém scripts PowerShell para facilitar o gerenciamento do projeto.

## 📋 Scripts Disponíveis

### 🚀 Inicialização e Controle

#### `start-all.ps1`
Inicia toda a stack de desenvolvimento (Backend + PostgreSQL + Frontend).

```powershell
.\scripts\start-all.ps1
```

**O que faz:**
- Verifica se Docker está rodando
- Verifica portas 3000, 5432, 8080
- Inicia containers Docker (backend + postgres)
- Inicia frontend em nova janela
- Mostra URLs de acesso

#### `stop-all.ps1`
Para todos os serviços (Docker + Frontend).

```powershell
.\scripts\stop-all.ps1
```

**O que faz:**
- Para containers Docker
- Finaliza processos Node.js do frontend
- Mantém os dados do banco intactos

---

### 💾 Backup e Restore

#### `backup-database.ps1`
Cria backup do banco de dados PostgreSQL.

```powershell
.\scripts\backup-database.ps1
```

**O que faz:**
- Cria arquivo SQL na pasta `backups/`
- Nome do arquivo: `fluxodecaixa_YYYY-MM-DD_HH-mm-ss.sql`
- Mostra lista de backups existentes

**Quando usar:**
- Antes de atualizar o sistema
- Antes de executar `docker-compose down -v`
- Regularmente (diário/semanal)

#### `restore-database.ps1`
Restaura backup do banco de dados.

```powershell
# Modo interativo (escolhe da lista)
.\scripts\restore-database.ps1

# Especificar arquivo
.\scripts\restore-database.ps1 ..\backups\fluxodecaixa_2025-11-30_18-00-00.sql
```

**O que faz:**
- Lista backups disponíveis
- Pede confirmação (operação destrutiva)
- Dropa e recria o banco
- Restaura dados do backup
- Reinicia backend

⚠️ **ATENÇÃO:** Sobrescreve dados atuais!

---

### 🗑️ Limpeza

#### `clean-volumes.ps1`
Remove volumes Docker (APAGA DADOS!).

```powershell
.\scripts\clean-volumes.ps1
```

**O que faz:**
- Verifica se existe backup recente (< 24h)
- Oferece criar backup antes de continuar
- Exige confirmação dupla ("APAGAR" + "SIM")
- Executa `docker-compose down -v`

⛔ **MUITO PERIGOSO!** Use apenas quando necessário.

**Quando usar:**
- Corrigir problemas de corrupção de dados
- Mudar versão do PostgreSQL
- Limpar completamente para começar do zero

---

### ⚙️ Configuração

#### `setup-database.ps1`
Configura usuário e senha do PostgreSQL.

```powershell
.\scripts\setup-database.ps1
```

**O que faz:**
- Lê configurações do `.env`
- Cria ou atualiza usuário no PostgreSQL
- Cria banco de dados se não existir
- Testa conexão
- Instrui reiniciar backend

**Quando usar:**
- Primeira instalação
- Após mudar credenciais no `.env`
- Resolver problemas de conexão

#### `setup-autostart.ps1`
Configura inicialização automática no Windows.

```powershell
# Executar como Administrador
.\scripts\setup-autostart.ps1
```

**O que faz:**
- Cria tarefa agendada no Windows
- Executa `start-all.ps1` ao fazer login
- Inicia stack automaticamente

---

## 📚 Documentação Adicional

- **[BACKUP-README.md](./BACKUP-README.md)** - Guia completo sobre backup e segurança
- **[SCRIPTS-README.md](./SCRIPTS-README.md)** - Documentação detalhada dos scripts (se existir)

---

## 🎯 Fluxo de Trabalho Recomendado

### Dia a dia
```powershell
# Iniciar trabalho
.\scripts\start-all.ps1

# Parar no fim do dia
.\scripts\stop-all.ps1
```

### Antes de mudanças importantes
```powershell
# 1. Criar backup
.\scripts\backup-database.ps1

# 2. Fazer mudanças
# ... suas alterações ...

# 3. Se algo der errado
.\scripts\restore-database.ps1
```

### Manutenção semanal
```powershell
# Backup semanal
.\scripts\backup-database.ps1

# Limpar backups antigos (manter últimos 7 dias)
Get-ChildItem ..\backups\*.sql | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | 
    Remove-Item
```

---

## ⚠️ Comandos Perigosos - Evite!

| Comando | Efeito | Alternativa Segura |
|---------|--------|-------------------|
| `docker-compose down -v` | **APAGA DADOS!** | Use `.\scripts\clean-volumes.ps1` |
| `docker volume prune` | **APAGA VOLUMES!** | Use `.\scripts\clean-volumes.ps1` |
| `docker rm -v postgres` | **APAGA DADOS!** | Use `docker-compose restart` |

---

## 🆘 Troubleshooting

### Backend não inicia
```powershell
# Verificar logs
docker logs main --tail 50

# Reconfigurar banco
.\scripts\setup-database.ps1

# Reiniciar
docker-compose restart main
```

### Porta ocupada
```powershell
# O start-all.ps1 já trata disso automaticamente
# Mas se precisar verificar manualmente:
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

### Perdi meus dados
```powershell
# Restaurar último backup
.\scripts\restore-database.ps1
```

### Containers não sobem
```powershell
# Verificar Docker
docker info

# Recriar tudo
docker-compose down
docker-compose up -d
```

---

## 📝 Notas

- Todos os scripts **mantêm dados** por padrão (exceto `clean-volumes.ps1`)
- Backups são salvos em `../backups/` (não versionados no Git)
- Scripts são **idempotentes** - podem ser executados múltiplas vezes
- Compatível com **Windows PowerShell 5.1+**

---

**Última atualização:** 30/11/2025
