# Script para configurar autostart automático no Windows
# Execute este script como Administrador

param(
    [switch]$Force
)

# Verificar se está rodando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERRO: Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host "Clique com botão direito no PowerShell e selecione 'Executar como administrador'" -ForegroundColor Yellow
    exit 1
}

Write-Host "=== Configuração de Autostart GDASH ===" -ForegroundColor Cyan
Write-Host ""

# Obter caminho do projeto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
$checkScriptPath = Join-Path $projectRoot "scripts\check-containers.ps1"

Write-Host "Diretório do projeto: $projectRoot" -ForegroundColor Cyan
Write-Host "Script de verificação: $checkScriptPath" -ForegroundColor Cyan
Write-Host ""

# Verificar se o script de verificação existe
if (-not (Test-Path $checkScriptPath)) {
    Write-Host "ERRO: Script de verificação não encontrado: $checkScriptPath" -ForegroundColor Red
    exit 1
}

# Verificar se a tarefa já existe
$existingTask = Get-ScheduledTask -TaskName "GDASH - Verificar Containers" -ErrorAction SilentlyContinue

if ($existingTask -and -not $Force) {
    Write-Host "A tarefa 'GDASH - Verificar Containers' já existe!" -ForegroundColor Yellow
    Write-Host "Use -Force para substituir a tarefa existente" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Deseja substituir a tarefa existente? (S/N)"
    if ($response -ne "S" -and $response -ne "s") {
        Write-Host "Operação cancelada." -ForegroundColor Yellow
        exit 0
    }
    Unregister-ScheduledTask -TaskName "GDASH - Verificar Containers" -Confirm:$false
    Write-Host "Tarefa existente removida." -ForegroundColor Green
}

# Criar ação
Write-Host "Criando ação da tarefa..." -ForegroundColor Yellow
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -File `"$checkScriptPath`"" `
    -WorkingDirectory (Join-Path $projectRoot "scripts")

# Criar gatilhos
Write-Host "Criando gatilhos..." -ForegroundColor Yellow
$trigger1 = New-ScheduledTaskTrigger -AtLogOn
$trigger2 = New-ScheduledTaskTrigger `
    -Once `
    -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes 5) `
    -RepetitionDuration (New-TimeSpan -Days 365)

# Criar principal (executar com privilégios elevados)
Write-Host "Configurando permissões..." -ForegroundColor Yellow
$principal = New-ScheduledTaskPrincipal `
    -UserId "$env:USERDOMAIN\$env:USERNAME" `
    -RunLevel Highest

# Criar configurações
Write-Host "Configurando opções da tarefa..." -ForegroundColor Yellow
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 5) `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

# Registrar tarefa
Write-Host "Registrando tarefa agendada..." -ForegroundColor Yellow
try {
    Register-ScheduledTask `
        -TaskName "GDASH - Verificar Containers" `
        -Description "Verifica e reinicia containers Docker do GDASH se necessário" `
        -Action $action `
        -Trigger @($trigger1, $trigger2) `
        -Principal $principal `
        -Settings $settings `
        -Force | Out-Null
    
    Write-Host ""
    Write-Host "=== Tarefa agendada criada com sucesso! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "A tarefa irá:" -ForegroundColor Cyan
    Write-Host "  - Executar ao fazer logon no Windows" -ForegroundColor White
    Write-Host "  - Verificar containers a cada 5 minutos" -ForegroundColor White
    Write-Host "  - Reiniciar containers que estiverem parados" -ForegroundColor White
    Write-Host ""
    Write-Host "Para verificar a tarefa:" -ForegroundColor Yellow
    Write-Host "  - Abra o Agendador de Tarefas (taskschd.msc)" -ForegroundColor White
    Write-Host "  - Procure por 'GDASH - Verificar Containers'" -ForegroundColor White
    Write-Host ""
    Write-Host "Para testar agora:" -ForegroundColor Yellow
    Write-Host "  .\scripts\check-containers.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "IMPORTANTE: Configure o Docker Desktop para iniciar automaticamente:" -ForegroundColor Yellow
    Write-Host "  1. Abra Docker Desktop" -ForegroundColor White
    Write-Host "  2. Settings → General" -ForegroundColor White
    Write-Host "  3. Marque 'Start Docker Desktop when you log in'" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERRO ao criar tarefa agendada: $_" -ForegroundColor Red
    exit 1
}

