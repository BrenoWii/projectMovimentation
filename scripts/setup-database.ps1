# Script para configurar usuario e senha do PostgreSQL
# Cria usuario ou altera senha conforme necessario

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURACAO DO BANCO DE DADOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ler configuracoes do .env
Write-Host "Lendo configuracoes do .env..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "ERRO: Arquivo .env nao encontrado!" -ForegroundColor Red
    Write-Host "Copie o arquivo env.example para .env e configure as variaveis." -ForegroundColor Yellow
    exit 1
}

# Parsear .env
$envVars = @{}
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)\s*=\s*(.+)\s*$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

$DB_USERNAME = $envVars['DB_USERNAME']
$DB_PASSWORD = $envVars['DB_PASSWORD']
$DB_DATABASE = $envVars['DB_DATABASE']

Write-Host "Usuario configurado: $DB_USERNAME" -ForegroundColor White
Write-Host "Banco de dados: $DB_DATABASE" -ForegroundColor White
Write-Host ""

# Verificar se o container postgres esta rodando
Write-Host "Verificando container postgres..." -ForegroundColor Yellow

$postgresRunning = docker ps --filter "name=postgres" --filter "status=running" --format "{{.Names}}"

if (-not $postgresRunning) {
    Write-Host ""
    Write-Host "Container postgres nao esta rodando. Iniciando..." -ForegroundColor Yellow
    docker-compose up -d postgres
    
    Write-Host "Aguardando PostgreSQL inicializar (10 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    $postgresRunning = docker ps --filter "name=postgres" --filter "status=running" --format "{{.Names}}"
    
    if (-not $postgresRunning) {
        Write-Host ""
        Write-Host "ERRO: Nao foi possivel iniciar o container postgres!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Container postgres esta rodando" -ForegroundColor Green
Write-Host ""

# Verificar se o usuario ja existe
Write-Host "Verificando se o usuario '$DB_USERNAME' ja existe..." -ForegroundColor Yellow

$userExists = docker exec postgres psql -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USERNAME'"

if ($userExists -eq "1") {
    Write-Host "Usuario '$DB_USERNAME' ja existe." -ForegroundColor Green
    Write-Host ""
    
    $alterPassword = Read-Host "Deseja alterar a senha do usuario? (S/N)"
    
    if ($alterPassword -eq "S" -or $alterPassword -eq "s") {
        Write-Host ""
        Write-Host "Alterando senha do usuario '$DB_USERNAME'..." -ForegroundColor Yellow
        
        docker exec postgres psql -U postgres -c "ALTER USER $DB_USERNAME WITH PASSWORD '$DB_PASSWORD';" | Out-Null
        
        Write-Host "Senha alterada com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "Senha nao foi alterada." -ForegroundColor Yellow
    }
} else {
    Write-Host "Usuario '$DB_USERNAME' nao existe. Criando..." -ForegroundColor Yellow
    Write-Host ""
    
    # Criar usuario
    docker exec postgres psql -U postgres -c "CREATE USER $DB_USERNAME WITH PASSWORD '$DB_PASSWORD';" | Out-Null
    
    # Dar permissoes de superuser
    docker exec postgres psql -U postgres -c "ALTER USER $DB_USERNAME WITH SUPERUSER;" | Out-Null
    
    Write-Host "Usuario '$DB_USERNAME' criado com sucesso!" -ForegroundColor Green
}

Write-Host ""

# Verificar se o banco de dados existe
Write-Host "Verificando banco de dados '$DB_DATABASE'..." -ForegroundColor Yellow

$dbExists = docker exec postgres psql -U postgres -lqt | Select-String -Pattern "\s$DB_DATABASE\s"

if ($dbExists) {
    Write-Host "Banco de dados '$DB_DATABASE' ja existe." -ForegroundColor Green
} else {
    Write-Host "Banco de dados '$DB_DATABASE' nao existe. Criando..." -ForegroundColor Yellow
    
    docker exec postgres psql -U postgres -c "CREATE DATABASE $DB_DATABASE OWNER $DB_USERNAME;" | Out-Null
    
    Write-Host "Banco de dados '$DB_DATABASE' criado com sucesso!" -ForegroundColor Green
}

Write-Host ""

# Testar conexao
Write-Host "Testando conexao com o banco de dados..." -ForegroundColor Yellow

$connectionTest = docker exec postgres psql -U $DB_USERNAME -d $DB_DATABASE -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "CONFIGURACAO CONCLUIDA COM SUCESSO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usuario: $DB_USERNAME" -ForegroundColor White
    Write-Host "Banco: $DB_DATABASE" -ForegroundColor White
    Write-Host "Host: postgres (dentro do Docker) ou localhost (externo)" -ForegroundColor White
    Write-Host "Porta: 5432" -ForegroundColor White
    Write-Host ""
    Write-Host "Proximo passo: Reinicie o backend" -ForegroundColor Cyan
    Write-Host "  docker-compose restart main" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERRO AO TESTAR CONEXAO!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Detalhes do erro:" -ForegroundColor Yellow
    Write-Host $connectionTest -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique as configuracoes no arquivo .env" -ForegroundColor Yellow
    exit 1
}
