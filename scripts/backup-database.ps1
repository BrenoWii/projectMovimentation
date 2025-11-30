# Script de Backup do Banco de Dados
# Cria um dump SQL do PostgreSQL

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BACKUP DO BANCO DE DADOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Criar pasta de backups se não existir
$backupDir = ".\backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "Pasta de backups criada: $backupDir" -ForegroundColor Green
}

# Gerar nome do arquivo com timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "$backupDir\fluxodecaixa_$timestamp.sql"

Write-Host "Verificando se o container postgres esta rodando..." -ForegroundColor Yellow

$postgresRunning = docker ps --filter "name=postgres" --filter "status=running" --format "{{.Names}}"

if (-not $postgresRunning) {
    Write-Host ""
    Write-Host "ERRO: Container postgres nao esta rodando!" -ForegroundColor Red
    Write-Host "Execute: docker-compose up -d postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host "Container postgres encontrado: $postgresRunning" -ForegroundColor Green
Write-Host ""
Write-Host "Criando backup..." -ForegroundColor Yellow

# Executar pg_dump
try {
    docker exec postgres pg_dump -U postgres -d fluxodecaixa > $backupFile
    
    if (Test-Path $backupFile) {
        $fileSize = (Get-Item $backupFile).Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "BACKUP CRIADO COM SUCESSO!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Arquivo: $backupFile" -ForegroundColor White
        Write-Host "Tamanho: $fileSizeKB KB" -ForegroundColor White
        Write-Host ""
        Write-Host "Para restaurar este backup, execute:" -ForegroundColor Cyan
        Write-Host "  .\restore-database.ps1 $backupFile" -ForegroundColor Yellow
        Write-Host ""
        
        # Listar backups existentes
        $backups = Get-ChildItem $backupDir -Filter "*.sql" | Sort-Object LastWriteTime -Descending
        Write-Host "Backups disponiveis ($($backups.Count)):" -ForegroundColor Cyan
        foreach ($backup in $backups) {
            $size = [math]::Round($backup.Length / 1KB, 2)
            Write-Host "  - $($backup.Name) ($size KB) - $($backup.LastWriteTime)" -ForegroundColor White
        }
    } else {
        Write-Host "ERRO: Arquivo de backup nao foi criado!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "ERRO ao criar backup: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
