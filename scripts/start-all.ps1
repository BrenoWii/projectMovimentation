# Script para iniciar Backend (Docker) + Frontend automaticamente
# Uso: .\start-all.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INICIANDO STACK DE DESENVOLVIMENTO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Aviso de backup
Write-Host "DICA: Faca backup regularmente do banco de dados!" -ForegroundColor Yellow
Write-Host "      Execute: .\backup-database.ps1" -ForegroundColor Yellow
Write-Host ""

# Diretorios
$BACKEND_DIR = $PSScriptRoot
$FRONTEND_DIR = "C:\Users\Breno\OneDrive\Documentos\Projetos\movimentation-front-end"

# Verificar se Docker esta rodando
Write-Host "`nVerificando Docker..." -ForegroundColor Cyan
try {
    docker info | Out-Null
    Write-Host "Docker esta rodando" -ForegroundColor Green
} catch {
    Write-Host "Docker nao esta rodando. Iniciando Docker Desktop..." -ForegroundColor Red
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Aguardando Docker iniciar (60 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
    
    # Verificar novamente
    try {
        docker info | Out-Null
        Write-Host "Docker iniciado com sucesso" -ForegroundColor Green
    } catch {
        Write-Host "Erro: Docker nao conseguiu iniciar. Verifique manualmente." -ForegroundColor Red
        exit 1
    }
}

# Navegar para o diretorio do backend
Set-Location $BACKEND_DIR

# Liberar porta 5432 (PostgreSQL) se estiver ocupada
Write-Host "`nVerificando porta 5432 (PostgreSQL)..." -ForegroundColor Cyan
$port5432Process = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
if ($port5432Process) {
    Write-Host "Porta 5432 ocupada. Liberando..." -ForegroundColor Yellow
    $processIds = $port5432Process.OwningProcess | Select-Object -Unique
    foreach ($processId in $processIds) {
        # Não matar processos do sistema (0, 4) nem do Docker
        $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
        if ($processId -ne 0 -and $processId -ne 4 -and $processName -notlike "*docker*" -and $processName -notlike "*com.docker*") {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Write-Host "Processo $processId ($processName) finalizado" -ForegroundColor Green
        } else {
            Write-Host "Ignorando processo do sistema/Docker: $processId ($processName)" -ForegroundColor Gray
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "Porta 5432 livre" -ForegroundColor Green
}

# Liberar porta 3000 se estiver ocupada
Write-Host "`nVerificando porta 3000..." -ForegroundColor Cyan
$port3000Process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000Process) {
    Write-Host "Porta 3000 ocupada. Liberando..." -ForegroundColor Yellow
    $processIds = $port3000Process.OwningProcess | Select-Object -Unique
    foreach ($processId in $processIds) {
        # Não matar processos do sistema (0, 4) nem do Docker
        $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
        if ($processId -ne 0 -and $processId -ne 4 -and $processName -notlike "*docker*" -and $processName -notlike "*com.docker*") {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Write-Host "Processo $processId ($processName) finalizado" -ForegroundColor Green
        } else {
            Write-Host "Ignorando processo do sistema/Docker: $processId ($processName)" -ForegroundColor Gray
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "Porta 3000 livre" -ForegroundColor Green
}

# Verificar se arquivo .env existe
if (-not (Test-Path ".env")) {
    Write-Host "Arquivo .env nao encontrado. Copiando de env.example..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "Arquivo .env criado. Configure as variaveis antes de continuar!" -ForegroundColor Green
        notepad .env
        Read-Host "Pressione Enter apos configurar o .env"
    } else {
        Write-Host "Arquivo env.example nao encontrado!" -ForegroundColor Red
        exit 1
    }
}

# Iniciar Backend com Docker Compose
Write-Host "`nIniciando Backend (Docker Compose)..." -ForegroundColor Cyan

# Limpar containers antigos primeiro
Write-Host "Limpando containers antigos..." -ForegroundColor Yellow
docker-compose down 2>$null
Start-Sleep -Seconds 2

docker-compose up -d

# Aguardar servicos iniciarem
Write-Host "Aguardando servicos iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar status dos containers
Write-Host "`nStatus dos Containers:" -ForegroundColor Cyan
docker-compose ps

# Liberar porta 8080 se estiver ocupada
Write-Host "`nVerificando porta 8080..." -ForegroundColor Cyan
$port8080Process = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080Process) {
    Write-Host "Porta 8080 ocupada. Liberando..." -ForegroundColor Yellow
    $processIds = $port8080Process.OwningProcess | Select-Object -Unique
    foreach ($processId in $processIds) {
        # Não matar processos do sistema (0, 4) nem do Docker
        $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
        if ($processId -ne 0 -and $processId -ne 4 -and $processName -notlike "*docker*" -and $processName -notlike "*com.docker*") {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Write-Host "Processo $processId ($processName) finalizado" -ForegroundColor Green
        } else {
            Write-Host "Ignorando processo do sistema/Docker: $processId ($processName)" -ForegroundColor Gray
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "Porta 8080 livre" -ForegroundColor Green
}

# Verificar se frontend existe
if (Test-Path $FRONTEND_DIR) {
    Write-Host "`nIniciando Frontend..." -ForegroundColor Cyan
    
    # Iniciar frontend em nova janela do PowerShell
    $frontendScript = @"
Set-Location '$FRONTEND_DIR'
Write-Host 'Frontend iniciando...' -ForegroundColor Cyan
yarn serve
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
    Write-Host "Frontend iniciado em nova janela" -ForegroundColor Green
} else {
    Write-Host "Diretorio do frontend nao encontrado: $FRONTEND_DIR" -ForegroundColor Yellow
    Write-Host "Ajuste a variavel FRONTEND_DIR no script" -ForegroundColor Yellow
}

# Resumo
Write-Host "`nStack iniciada com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Gray
Write-Host "Backend:   http://localhost:3000" -ForegroundColor Cyan
Write-Host "Swagger:   http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "Postgres:  localhost:5432" -ForegroundColor Cyan
Write-Host "Frontend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "Tailscale: http://100.113.154.3:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Gray

Write-Host "`nComandos uteis:" -ForegroundColor Yellow
Write-Host "   Ver logs:    docker-compose logs -f" -ForegroundColor White
Write-Host "   Parar tudo:  docker-compose down" -ForegroundColor White
Write-Host "   Reiniciar:   docker-compose restart" -ForegroundColor White
Write-Host ""
