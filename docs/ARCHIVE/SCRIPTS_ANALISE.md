# Análise de Scripts - GDASH Challenge 2025/02

**Última atualização:** 23/11/2025

---

## Scripts na Raiz do Projeto

### Scripts PowerShell

#### 1. `start-system.ps1`

**Propósito:** Wrapper para iniciar o sistema via Docker Compose

**Funcionalidades:**
- Verifica se Docker está instalado
- Verifica se Docker Compose está disponível
- Verifica se Docker Desktop está rodando (tenta iniciar se não estiver)
- Executa `docker compose up -d`
- Exibe status dos serviços
- Mostra URLs e credenciais

**Equivalente:** `docker compose up -d`

**Necessário?** Não (docker compose funciona sozinho)

**Recomendação:** Manter - Útil para usuários Windows, não causa conflitos

---

#### 2. `stop-system.ps1`

**Propósito:** Wrapper para parar o sistema via Docker Compose

**Funcionalidades:**
- Verifica se Docker está disponível
- Executa `docker compose down`
- Exibe mensagens informativas

**Equivalente:** `docker compose down`

**Necessário?** Não (docker compose funciona sozinho)

**Recomendação:** Manter - Útil para usuários Windows, não causa conflitos

---

### Scripts Shell (Bash)

#### 3. `test-system-complete.sh`

**Propósito:** Script completo de testes manuais do sistema

**Funcionalidades:**
- Testa healthchecks de todos os serviços
- Testa autenticação
- Testa endpoints de weather logs
- Testa novos endpoints (precipitation, forecast)
- Testa insights de IA
- Testa CRUD de usuários
- Testa exportação (CSV/XLSX)
- Verifica dados e campos
- Gera relatório de testes

**Localização:** Raiz do projeto

**Necessário?** Não (testes podem ser feitos manualmente)

**Recomendação:** Manter - Útil para testes manuais rápidos

---

#### 4. `docs/test-system.sh`

**Propósito:** Script de testes do sistema (versão simplificada)

**Funcionalidades:**
- Similar ao `test-system-complete.sh`, mas mais simples
- Testa endpoints básicos
- Gera relatório básico

**Localização:** `docs/`

**Necessário?** Não (duplicata do `test-system-complete.sh`)

**Recomendação:** Remover - Duplicata, `test-system-complete.sh` é mais completo

---

#### 5. `colletor-python/run.sh`

**Propósito:** Script para executar o collector localmente (fora do Docker)

**Funcionalidades:**
- Ativa ambiente virtual Python (se existir)
- Executa `python3 src/main.py`

**Localização:** `colletor-python/`

**Necessário?** Não (collector roda via Docker)

**Recomendação:** Manter - Útil para desenvolvimento local e debug

---

## Análise de Necessidade

### Scripts Essenciais

**Nenhum** - O Docker Compose funciona completamente sem scripts auxiliares.

### Scripts Úteis (Recomendado Manter)

1. **`start-system.ps1`** - Facilita uso no Windows
2. **`stop-system.ps1`** - Facilita uso no Windows
3. **`test-system-complete.sh`** - Facilita testes manuais
4. **`colletor-python/run.sh`** - Facilita desenvolvimento local

### Scripts Desnecessários (Pode Remover)

1. **`docs/test-system.sh`** - Duplicata do `test-system-complete.sh`

---

## Conclusão e Recomendações

### Manter

- `start-system.ps1` - Útil para Windows
- `stop-system.ps1` - Útil para Windows
- `test-system-complete.sh` - Útil para testes manuais
- `colletor-python/run.sh` - Útil para desenvolvimento

### Remover

- `docs/test-system.sh` - Duplicata, menos completo que `test-system-complete.sh`

### Observações

- Nenhum script causa conflitos com Docker Compose
- Todos os scripts são opcionais
- Docker Compose funciona perfeitamente sem scripts
- Scripts PowerShell são específicos para Windows
- Scripts Shell são específicos para Linux/macOS

---

**Recomendação Final:** Manter todos exceto `docs/test-system.sh` (duplicata)

