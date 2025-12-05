# Configuração de Autostart no Windows

Este guia explica como configurar o sistema para iniciar automaticamente os containers Docker quando o computador ligar, garantindo que a coleta de dados climáticos continue funcionando mesmo quando você não estiver usando o computador.

## 📋 Pré-requisitos

1. Docker Desktop instalado
2. PowerShell (já vem com Windows)
3. Permissões de administrador (para configurar tarefa agendada)

## 🚀 Configuração Passo a Passo

### 1. Configurar Docker Desktop para Iniciar Automaticamente

1. Abra o Docker Desktop
2. Vá em **Settings** (Configurações) → **General**
3. Marque a opção **"Start Docker Desktop when you log in"** (Iniciar Docker Desktop ao fazer login)
4. Clique em **Apply & Restart**

### 2. Configurar Tarefa Agendada do Windows

A tarefa agendada irá:
- Verificar se os containers estão rodando a cada 5 minutos
- Reiniciar containers que estiverem parados
- Garantir que o Docker Desktop esteja rodando

#### Opção A: Usando Interface Gráfica (Recomendado)

1. Abra o **Agendador de Tarefas** (Task Scheduler):
   - Pressione `Win + R`
   - Digite `taskschd.msc` e pressione Enter

2. No painel direito, clique em **Criar Tarefa...**

3. Na aba **Geral**:
   - **Nome**: `GDASH - Verificar Containers`
   - **Descrição**: `Verifica e reinicia containers Docker do GDASH se necessário`
   - Marque **Executar com privilégios mais altos**

4. Na aba **Gatilhos**:
   - Clique em **Novo...**
   - **Iniciar a tarefa**: `Ao fazer logon`
   - Marque **Habilitado**
   - Clique em **OK**
   - Clique em **Novo...** novamente
   - **Iniciar a tarefa**: `Em uma agenda`
   - **Recorrer a cada**: `5 minutos`
   - **Repetir tarefa a cada**: `5 minutos`
   - **Duração**: `Indefinidamente`
   - Marque **Habilitado**
   - Clique em **OK**

5. Na aba **Ações**:
   - Clique em **Novo...**
   - **Ação**: `Iniciar um programa`
   - **Programa/script**: `powershell.exe`
   - **Adicionar argumentos**: `-ExecutionPolicy Bypass -File "C:\Users\caiod\desafio-GDASH\scripts\check-containers.ps1"`
   - **Iniciar em**: `C:\Users\caiod\desafio-GDASH\scripts`
   - Clique em **OK**

6. Na aba **Condições**:
   - Desmarque **Iniciar a tarefa somente se o computador estiver em CA**
   - Marque **Acordar o computador para executar esta tarefa** (opcional, mas recomendado)
   - Desmarque **Parar se o computador mudar para CA**

7. Na aba **Configurações**:
   - Marque **Permitir tarefa ser executada sob demanda**
   - Marque **Executar tarefa o mais rápido possível após uma inicialização agendada perdida**
   - Marque **Se a tarefa falhar, reiniciar a cada**: `5 minutos`
   - **Tentativas de reinício**: `3`
   - Marque **Se a tarefa em execução não terminar quando solicitado, forçá-la a parar**

8. Clique em **OK** e informe a senha de administrador se solicitado

#### Opção B: Usando PowerShell (Mais Rápido)

Execute o PowerShell como **Administrador** e cole o seguinte comando:

```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$PWD\scripts\check-containers.ps1`"" -WorkingDirectory "$PWD\scripts"

$trigger1 = New-ScheduledTaskTrigger -AtLogOn
$trigger2 = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 365)

$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 5)

Register-ScheduledTask -TaskName "GDASH - Verificar Containers" -Description "Verifica e reinicia containers Docker do GDASH se necessário" -Action $action -Trigger @($trigger1, $trigger2) -Principal $principal -Settings $settings
```

**Nota**: Ajuste o caminho `$PWD` se necessário. O comando acima assume que você está no diretório raiz do projeto.

### 3. Configurar Inicialização Automática dos Containers

Execute o script de inicialização uma vez para garantir que tudo esteja configurado:

```powershell
.\scripts\start-docker-containers.ps1
```

### 4. Verificar se Está Funcionando

1. **Verificar Tarefa Agendada**:
   - Abra o Agendador de Tarefas
   - Procure por "GDASH - Verificar Containers"
   - Verifique se está com status "Pronto"

2. **Testar Manualmente**:
   ```powershell
   # Execute o script de verificação
   .\scripts\check-containers.ps1
   
   # Verifique os containers
   docker-compose ps
   ```

3. **Verificar Logs**:
   ```powershell
   # Ver logs do producer (coleta de dados)
   docker-compose logs -f producer
   ```

## 🔍 Verificação e Monitoramento

### Verificar Status dos Containers

```powershell
docker-compose ps
```

Todos os serviços devem estar com status "Up" e healthcheck "healthy".

### Ver Logs em Tempo Real

```powershell
# Logs do producer (coleta de dados)
docker-compose logs -f producer

# Logs de todos os serviços
docker-compose logs -f
```

### Verificar Histórico de Execução da Tarefa

1. Abra o **Agendador de Tarefas**
2. Encontre a tarefa "GDASH - Verificar Containers"
3. Clique com botão direito → **Histórico**
4. Verifique se há execuções recentes e se estão com sucesso

## 🛠️ Solução de Problemas

### Containers não iniciam automaticamente

1. Verifique se o Docker Desktop está configurado para iniciar automaticamente
2. Verifique se a tarefa agendada está habilitada
3. Execute manualmente: `.\scripts\start-docker-containers.ps1`

### Docker Desktop não inicia

1. Verifique se o Docker Desktop está instalado corretamente
2. Tente iniciar manualmente: `Start-Process "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"`
3. Verifique os logs do Docker Desktop

### Tarefa agendada não executa

1. Verifique se a tarefa está habilitada no Agendador de Tarefas
2. Verifique se você tem permissões de administrador
3. Execute a tarefa manualmente pelo Agendador de Tarefas
4. Verifique o histórico de execução da tarefa

### Computador entra em suspensão

Para garantir que a coleta continue mesmo quando o computador "dorme":

1. Vá em **Configurações do Windows** → **Sistema** → **Energia e suspensão**
2. Configure **Quando conectado à energia, o PC entra em suspensão após**: `Nunca`
3. Ou configure **Quando conectado à energia, desligar a tela após**: um tempo maior (ex: 30 minutos)

**Nota**: Se o computador entrar em suspensão profunda (hibernação), os containers podem parar. Para produção, considere usar um servidor sempre ligado ou um serviço de nuvem.

## 📝 Notas Importantes

- A tarefa agendada verifica os containers a cada 5 minutos
- Se um container parar, ele será reiniciado automaticamente
- O Docker Desktop precisa estar rodando para os containers funcionarem
- Se o computador reiniciar, a tarefa agendada iniciará os containers automaticamente
- Os logs do producer mostram quando cada coleta de dados acontece

## 🎯 Resultado Esperado

Após configurar tudo:

1. ✅ Docker Desktop inicia automaticamente ao fazer login
2. ✅ Containers são iniciados automaticamente
3. ✅ Containers são verificados e reiniciados a cada 5 minutos se necessário
4. ✅ Dados climáticos são coletados a cada hora, mesmo quando você não está usando o computador
5. ✅ Sistema continua funcionando após reinicializações do Windows

## 🔄 Atualizar Configuração

Se você mover o projeto para outro diretório, será necessário atualizar os caminhos na tarefa agendada:

1. Abra o Agendador de Tarefas
2. Encontre "GDASH - Verificar Containers"
3. Clique com botão direito → **Propriedades**
4. Na aba **Ações**, edite o caminho do script
5. Salve as alterações

