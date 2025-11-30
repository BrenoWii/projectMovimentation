# 🚀 Scripts de Automação - Movimentation Stack

Scripts PowerShell para automatizar o início/parada da stack completa (Backend + Frontend + Database).

## 📋 Scripts Disponíveis

### 1. `start-all.ps1` - Iniciar tudo
Inicia o backend (Docker Compose) e frontend automaticamente.

```powershell
.\start-all.ps1
```

**O que faz:**
- ✅ Verifica se Docker está rodando (inicia se necessário)
- ✅ Verifica arquivo `.env` (copia de `env.example` se não existir)
- ✅ Inicia PostgreSQL (Docker)
- ✅ Inicia Backend NestJS (Docker)
- ✅ Inicia Frontend em nova janela (Yarn/Quasar)
- ✅ Exibe URLs e status dos serviços

### 2. `stop-all.ps1` - Parar tudo
Para todos os containers Docker e processos Node.

```powershell
.\stop-all.ps1
```

**O que faz:**
- 🛑 Para containers Docker (backend + postgres)
- 🛑 Para processos Node (frontend)

### 3. `setup-autostart.ps1` - Configurar inicialização automática
Cria uma tarefa agendada do Windows para iniciar a stack automaticamente ao fazer login.

```powershell
# Executar como Administrador
.\setup-autostart.ps1
```

**O que faz:**
- ⚙️ Cria tarefa agendada no Windows
- 🚀 Stack inicia automaticamente ao fazer login
- 🔄 Executado em segundo plano

## 🛠️ Configuração Inicial

### 1. Ajustar caminho do Frontend

Edite o arquivo `start-all.ps1` e ajuste a variável `$FRONTEND_DIR`:

```powershell
$FRONTEND_DIR = "C:\Users\Breno\OneDrive\Documentos\Projetos\movimentation-front"
```

### 2. Configurar arquivo .env

Se não existir, o script criará automaticamente de `env.example`. Configure:

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=movimentation
JWT_SECRET=sua_chave_secreta_aqui
```

### 3. Permitir execução de scripts PowerShell (se necessário)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📡 URLs após inicialização

- 🌐 Backend API: http://localhost:3000
- 📚 Swagger Docs: http://localhost:3000/api
- 🗄️ PostgreSQL: localhost:5432
- 🎨 Frontend: http://localhost:8080
- 📡 Tailscale (Backend): http://100.113.154.3:3000
- 📡 Tailscale (Frontend): http://100.113.154.3:8080

## 🐳 Comandos Docker Úteis

```powershell
# Ver logs em tempo real
docker-compose logs -f

# Ver logs apenas do backend
docker-compose logs -f main

# Reiniciar apenas o backend
docker-compose restart main

# Reconstruir imagens
docker-compose build

# Limpar tudo (remove volumes)
docker-compose down -v
```

## 🔧 Troubleshooting

### Docker não inicia automaticamente
- Certifique-se que Docker Desktop está instalado
- Ajuste o caminho no script se necessário
- Aumentar tempo de espera (altere `Start-Sleep -Seconds 30`)

### Frontend não inicia
- Verifique se o caminho `$FRONTEND_DIR` está correto
- Certifique-se que `yarn` está instalado
- Verifique se existe `package.json` no diretório do frontend

### Porta já em uso
```powershell
# Verificar processos na porta 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Matar processo na porta 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

### Desabilitar inicialização automática
```powershell
Unregister-ScheduledTask -TaskName "Movimentation Stack Auto Start"
```

## 📝 Notas

- Backend roda em **Docker** (mais confiável e isolado)
- Frontend roda **nativamente** com Yarn (hot reload mais rápido)
- Logs do Docker ficam salvos e podem ser consultados depois
- Script cria janelas separadas para melhor visualização

## 🎯 Fluxo de Trabalho Recomendado

### Desenvolvimento diário:
```powershell
# Manhã - iniciar tudo
.\start-all.ps1

# Trabalhar normalmente...

# Fim do dia - parar tudo
.\stop-all.ps1
```

### Inicialização automática:
```powershell
# Configurar uma vez (como admin)
.\setup-autostart.ps1

# Agora ao ligar o PC, tudo inicia automaticamente!
```

---

**Criado para facilitar o desenvolvimento do Movimentation System** 🚀
