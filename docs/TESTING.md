# Guia de Testes

## Teste de Sistema Automatizado

O projeto inclui um script robusto que verifica a integridade de todos os componentes.

### Executando os Testes
Os testes são executados automaticamente como a etapa final do script `start.sh`. Para executá-los manualmente em um sistema que já está rodando:

```bash
# Certifique-se de que os serviços estão rodando (docker compose up)
./start.sh
```
*O script irá pular a etapa de inicialização se os serviços já estiverem de pé, ou reiniciá-los se necessário, e executará as verificações ao final.*

## Testes de Componentes (Unitários)

Cada microsserviço possui sua própria suíte de testes.

### API (NestJS)
```bash
cd api-nest
npm run test
```

### Worker (Go)
```bash
cd worker-go
go test ./...
```

### Collector (Python)
```bash
cd colletor-python
pytest
```

### Frontend (React)
```bash
cd frontend-react
npm run test
```
