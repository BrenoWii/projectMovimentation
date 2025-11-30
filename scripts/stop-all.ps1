# Script para parar Backend e Frontend
# Uso: .\stop-all.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PARANDO STACK DE DESENVOLVIMENTO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Aviso sobre backup
Write-Host "LEMBRETE: Se pretende limpar volumes, faca backup primeiro!" -ForegroundColor Yellow
Write-Host "          .\backup-database.ps1" -ForegroundColor Yellow
Write-Host ""

# Diretório do backend
$BACKEND_DIR = $PSScriptRoot
Set-Location $BACKEND_DIR

# Parar containers Docker
Write-Host "`n🐳 Parando containers Docker..." -ForegroundColor Cyan
docker-compose down

Write-Host "✅ Containers Docker parados" -ForegroundColor Green

# Parar processos Node (frontend)
Write-Host "`n🎨 Parando processos do Frontend..." -ForegroundColor Cyan
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "   Parando processo Node PID: $($_.Id)" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✅ Processos Node parados" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Nenhum processo Node encontrado" -ForegroundColor Gray
}

Write-Host "`n✨ Stack parada com sucesso!" -ForegroundColor Green
