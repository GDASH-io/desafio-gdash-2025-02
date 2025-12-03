# Guia de Contribuição

Obrigado por considerar contribuir para o projeto GDASH!

## Como Contribuir

### 1. Reportar Bugs

Use o template de [Bug Report](/.github/ISSUE_TEMPLATE/bug_report.md) para reportar problemas.

### 2. Sugerir Features

Use o template de [Feature Request](/.github/ISSUE_TEMPLATE/feature_request.md) para sugerir melhorias.

### 3. Submeter Pull Requests

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Padrões de Código

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova feature
fix: corrige bug
docs: atualiza documentação
style: formatação
refactor: refatoração
test: adiciona testes
chore: tarefas de manutenção
```

### Formatação

- Execute `npm run format` antes de commitar
- Execute `npm run lint` para verificar erros
- Backend e Frontend têm configurações de Prettier

### Testes

- Adicione testes para novas features
- Mantenha cobertura mínima de 70%
- Execute `npm test` antes de submeter PR

## Estrutura do Projeto

```
.
├── backend/          # API NestJS
├── frontend/         # Interface React
├── collector-python/ # Coletor de dados
├── worker-go/        # Processador de filas
└── docs/             # Documentação
```

## Checklist de PR

- [ ] Código segue padrões de estilo
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Sem warnings de lint
- [ ] Todos os testes passam
- [ ] Cobertura de testes mantida

## Code Review

- PRs requerem aprovação de pelo menos um revisor
- Feedback construtivo é bem-vindo
- Resolva comentários antes de merge

## Dúvidas?

Abra uma issue ou entre em contato com os maintainers.

