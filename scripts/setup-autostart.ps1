# Script para criar tarefa agendada no Windows
# Executa o start-all.ps1 automaticamente ao fazer login
# Uso: Executar como Administrador: .\setup-autostart.ps1

Write-Host "⚙️  Configurando inicialização automática..." -ForegroundColor Cyan

$scriptPath = Join-Path $PSScriptRoot "start-all.ps1"
$taskName = "Movimentation Stack Auto Start"
$taskDescription = "Inicia automaticamente Backend (Docker) e Frontend ao fazer login"

# Verificar se já existe uma tarefa
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "⚠️  Tarefa '$taskName' já existe. Removendo..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Criar ação: executar PowerShell com o script
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""

# Criar trigger: ao fazer login
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

# Criar configurações da tarefa
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

# Registrar tarefa agendada
Register-ScheduledTask `
    -TaskName $taskName `
    -Description $taskDescription `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -User $env:USERNAME `
    -RunLevel Highest

Write-Host "`n✅ Tarefa agendada criada com sucesso!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📝 Nome da tarefa: $taskName" -ForegroundColor Cyan
Write-Host "🚀 A stack será iniciada automaticamente ao fazer login" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n📝 Para desabilitar a inicialização automática:" -ForegroundColor Yellow
Write-Host "   Executar: Unregister-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
Write-Host ""
