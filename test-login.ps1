# Teste 1: Login com senha da variável
Write-Host '=== Teste 1: Senha da variável ==='
Invoke-RestMethod -Uri 'https://nestjs-api-production-975b.up.railway.app/api/auth/login' -Method POST -Body (@{email='admin@example.com';password='ede0ec95fedbd15f8628aa37'} | ConvertTo-Json) -ContentType 'application/json'

# Teste 2: Login com senha padrão
Write-Host '
=== Teste 2: Senha padrão 123456 ==='
Invoke-RestMethod -Uri 'https://nestjs-api-production-975b.up.railway.app/api/auth/login' -Method POST -Body (@{email='admin@example.com';password='123456'} | ConvertTo-Json) -ContentType 'application/json'
