# Script PERIGOSO - Remove volumes e APAGA DADOS
# Use apenas quando necessario e SEMPRE faca backup antes!

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Red
Write-Host "   LIMPEZA DE VOLUMES - OPERACAO PERIGOSA" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "ATENCAO: Esta operacao ira:" -ForegroundColor Red
Write-Host "  - APAGAR todos os dados do banco de dados" -ForegroundColor Red
Write-Host "  - REMOVER volumes Docker permanentemente" -ForegroundColor Red
Write-Host "  - Voce perdera TODAS as movimentacoes, usuarios e classificacoes" -ForegroundColor Red
Write-Host ""

# Verificar se existe backup recente
$backupDir = ".\backups"
$hasRecentBackup = $false

if (Test-Path $backupDir) {
    $recentBackups = Get-ChildItem $backupDir -Filter "*.sql" | 
                     Where-Object { $_.LastWriteTime -gt (Get-Date).AddHours(-24) } |
                     Sort-Object LastWriteTime -Descending
    
    if ($recentBackups.Count -gt 0) {
        $hasRecentBackup = $true
        Write-Host "Backup recente encontrado:" -ForegroundColor Green
        Write-Host "  - $($recentBackups[0].Name) ($($recentBackups[0].LastWriteTime))" -ForegroundColor White
        Write-Host ""
    }
}

if (-not $hasRecentBackup) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "AVISO: NENHUM BACKUP RECENTE ENCONTRADO!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Voce deveria criar um backup antes de continuar!" -ForegroundColor Yellow
    Write-Host "Execute: .\backup-database.ps1" -ForegroundColor Yellow
    Write-Host ""
    
    $createBackup = Read-Host "Deseja criar um backup agora? (S/N)"
    
    if ($createBackup -eq "S" -or $createBackup -eq "s") {
        Write-Host ""
        Write-Host "Criando backup de seguranca..." -ForegroundColor Yellow
        & .\backup-database.ps1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "ERRO ao criar backup! Operacao cancelada." -ForegroundColor Red
            exit 1
        }
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Red
Write-Host "CONFIRMACAO FINAL" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

$confirm1 = Read-Host "Digite 'APAGAR' para confirmar que deseja remover todos os dados"

if ($confirm1 -ne "APAGAR") {
    Write-Host "Cancelado pelo usuario." -ForegroundColor Yellow
    exit 0
}

$confirm2 = Read-Host "Tem CERTEZA ABSOLUTA? (digite 'SIM' para confirmar)"

if ($confirm2 -ne "SIM") {
    Write-Host "Cancelado pelo usuario." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Parando containers..." -ForegroundColor Yellow
docker-compose down -v

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "VOLUMES REMOVIDOS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Os dados foram apagados." -ForegroundColor White
Write-Host ""
Write-Host "Para iniciar novamente:" -ForegroundColor Cyan
Write-Host "  1. Execute: .\start-all.ps1" -ForegroundColor Yellow
Write-Host "  2. Crie novo usuario no sistema" -ForegroundColor Yellow
Write-Host "  3. Ou restaure backup: .\restore-database.ps1" -ForegroundColor Yellow
Write-Host ""
