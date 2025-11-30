# Script auxiliar para executar setup-autostart.ps1 como Administrador
# Uso: Clique com botão direito > "Executar com PowerShell"

$scriptPath = Join-Path $PSScriptRoot "setup-autostart.ps1"

# Verificar se já está rodando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
    # Já é admin, executar diretamente
    & $scriptPath
    Write-Host "`nPressione qualquer tecla para fechar..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} else {
    # Não é admin, solicitar elevação
    Write-Host "Solicitando permissões de Administrador..." -ForegroundColor Yellow
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -File `"$scriptPath`" -NoExit"
}
