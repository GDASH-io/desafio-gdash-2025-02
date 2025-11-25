@echo off
echo ================================================
echo     GDASH - Weather Intelligence System        
echo ================================================
echo.

REM Verificar Docker
echo Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker nao encontrado! Por favor, instale o Docker Desktop.
    echo Download: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo OK: Docker instalado

REM Verificar Docker Compose
echo Verificando Docker Compose...
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker Compose nao encontrado!
    pause
    exit /b 1
)
echo OK: Docker Compose instalado
echo.

REM Verificar arquivo .env
if not exist .env (
    echo Criando arquivo .env...
    copy .env.example .env
    echo OK: Arquivo .env criado
    echo.
    echo IMPORTANTE: Configure as seguintes variaveis no arquivo .env:
    echo    - OPENWEATHER_API_KEY
    echo    - OPENAI_API_KEY (opcional)
    echo    - JWT_SECRET
    echo.
    pause
)

echo ================================================
echo Iniciando containers Docker...
echo ================================================
echo.

REM Parar containers existentes
echo Parando containers existentes...
docker-compose down 2>nul

echo.
echo Iniciando servicos...
echo Isso pode levar alguns minutos na primeira vez...
echo.

REM Iniciar containers
docker-compose up -d

if errorlevel 0 (
    echo.
    echo ================================================
    echo Sistema iniciado com sucesso!
    echo ================================================
    echo.
    echo Acesse os servicos:
    echo    Frontend:  http://localhost:5173
    echo    API:       http://localhost:3000
    echo    API Docs:  http://localhost:3000/api/docs
    echo.
    echo Comandos uteis:
    echo    Ver logs:         docker-compose logs -f
    echo    Parar servicos:   docker-compose down
    echo    Reiniciar:        docker-compose restart
    echo.
    
    start http://localhost:5173
) else (
    echo.
    echo ERRO: Falha ao iniciar containers!
    echo Verifique os logs com: docker-compose logs
)

pause
