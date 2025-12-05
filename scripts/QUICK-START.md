# Guia Rápido - Autostart no Windows

## 🚀 Configuração em 3 Passos

### 1. Configure Autostart (Execute como Administrador)

```powershell
# Abra PowerShell como Administrador
cd C:\Users\caiod\desafio-GDASH
.\scripts\setup-autostart.ps1
```

### 2. Configure Docker Desktop

1. Abra Docker Desktop
2. Settings → General
3. Marque **"Start Docker Desktop when you log in"**
4. Clique em **Apply & Restart**

### 3. Inicie os Containers

```powershell
.\scripts\start-docker-containers.ps1
```

## ✅ Pronto!

Agora o sistema irá:
- ✅ Iniciar containers automaticamente ao fazer logon
- ✅ Verificar containers a cada 5 minutos
- ✅ Reiniciar containers se pararem
- ✅ Coletar dados climáticos a cada hora, mesmo quando você não estiver usando o computador

## 🔍 Verificar se Está Funcionando

```powershell
# Ver status dos containers
docker-compose ps

# Ver logs do producer (coleta de dados)
docker-compose logs -f producer
```

## 📝 Scripts Disponíveis

- `setup-autostart.ps1` - Configura tarefa agendada (executar como Admin)
- `start-docker-containers.ps1` - Inicia Docker e containers
- `check-containers.ps1` - Verifica e reinicia containers se necessário

## ❓ Problemas?

Consulte [`README-WINDOWS-AUTOSTART.md`](README-WINDOWS-AUTOSTART.md) para solução de problemas detalhada.

