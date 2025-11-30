# Script de Restore do Banco de Dados
# Restaura um dump SQL no PostgreSQL

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RESTORE DO BANCO DE DADOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Se não foi fornecido arquivo, mostrar lista de backups
if (-not $BackupFile) {
    $backupDir = ".\backups"
    
    if (-not (Test-Path $backupDir)) {
        Write-Host "ERRO: Pasta de backups nao encontrada!" -ForegroundColor Red
        Write-Host "Execute primeiro: .\backup-database.ps1" -ForegroundColor Yellow
        exit 1
    }
    
    $backups = Get-ChildItem $backupDir -Filter "*.sql" | Sort-Object LastWriteTime -Descending
    
    if ($backups.Count -eq 0) {
        Write-Host "ERRO: Nenhum backup encontrado!" -ForegroundColor Red
        Write-Host "Execute primeiro: .\backup-database.ps1" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Backups disponiveis:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $backups.Count; $i++) {
        $size = [math]::Round($backups[$i].Length / 1KB, 2)
        Write-Host "  [$($i+1)] $($backups[$i].Name) ($size KB) - $($backups[$i].LastWriteTime)" -ForegroundColor White
    }
    
    Write-Host ""
    $selection = Read-Host "Escolha o numero do backup para restaurar (ou Enter para cancelar)"
    
    if ([string]::IsNullOrWhiteSpace($selection)) {
        Write-Host "Cancelado pelo usuario." -ForegroundColor Yellow
        exit 0
    }
    
    $index = [int]$selection - 1
    if ($index -lt 0 -or $index -ge $backups.Count) {
        Write-Host "ERRO: Selecao invalida!" -ForegroundColor Red
        exit 1
    }
    
    $BackupFile = $backups[$index].FullName
}

# Verificar se o arquivo existe
if (-not (Test-Path $BackupFile)) {
    Write-Host "ERRO: Arquivo de backup nao encontrado: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "Arquivo de backup: $BackupFile" -ForegroundColor Green
Write-Host ""

# Aviso de segurança
Write-Host "========================================" -ForegroundColor Red
Write-Host "ATENCAO: Esta operacao ira:" -ForegroundColor Red
Write-Host "  1. APAGAR todos os dados atuais" -ForegroundColor Red
Write-Host "  2. Restaurar os dados do backup" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Tem certeza que deseja continuar? (digite 'SIM' para confirmar)"

if ($confirm -ne "SIM") {
    Write-Host "Cancelado pelo usuario." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Verificando container postgres..." -ForegroundColor Yellow

$postgresRunning = docker ps --filter "name=postgres" --filter "status=running" --format "{{.Names}}"

if (-not $postgresRunning) {
    Write-Host ""
    Write-Host "ERRO: Container postgres nao esta rodando!" -ForegroundColor Red
    Write-Host "Execute: docker-compose up -d postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host "Container postgres encontrado" -ForegroundColor Green
Write-Host ""

try {
    # Dropar e recriar o banco
    Write-Host "Recriando banco de dados..." -ForegroundColor Yellow
    docker exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS fluxodecaixa;" | Out-Null
    docker exec postgres psql -U postgres -c "CREATE DATABASE fluxodecaixa;" | Out-Null
    
    # Restaurar backup
    Write-Host "Restaurando dados do backup..." -ForegroundColor Yellow
    Get-Content $BackupFile | docker exec -i postgres psql -U postgres -d fluxodecaixa | Out-Null
    
    # Verificar tabelas criadas
    Write-Host ""
    Write-Host "Verificando tabelas restauradas..." -ForegroundColor Yellow
    $tables = docker exec postgres psql -U postgres -d fluxodecaixa -c "\dt" 2>&1
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "RESTORE CONCLUIDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Reinicie o backend para aplicar as mudancas:" -ForegroundColor Cyan
    Write-Host "  docker-compose restart main" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERRO ao restaurar backup: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
