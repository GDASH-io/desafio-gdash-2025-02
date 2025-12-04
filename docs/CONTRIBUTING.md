# Contribuindo para o Weather Dashboard

Obrigado por considerar contribuir para o projeto! 🎉

## Como Contribuir

### 1. Fork o Projeto

```bash
# Clone seu fork
git clone https://github.com/seu-usuario/desafio_gdash.git
cd desafio_gdash
```

### 2. Crie uma Branch

```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-bugfix
```

### 3. Faça suas Alterações

- Siga os padrões de código do projeto (Prettier já configurado)
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário

### 4. Commit suas Mudanças

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
```

Usamos commits semânticos:
- `feat:` para novas funcionalidades
- `fix:` para correções de bugs
- `docs:` para documentação
- `style:` para formatação
- `refactor:` para refatoração
- `test:` para testes
- `chore:` para tarefas gerais

### 5. Push e Pull Request

```bash
git push origin feature/minha-feature
```

Abra um Pull Request no GitHub com:
- Descrição clara das mudanças
- Referência a issues relacionadas
- Screenshots (se aplicável)

## Padrões de Código

### Frontend (React)
- Use Prettier para formatação: `npm run format`
- Execute testes: `npm run test`
- Verifique cobertura: `npm run test:cov`

### Backend (NestJS)
- Use Prettier: `npm run format`
- Execute testes: `npm test`
- Verifique cobertura: `npm run test:cov`

### Go Worker
- Use `go fmt` para formatação
- Execute testes: `go test ./...`

### Python Collector
- Use Black para formatação: `black .`
- Execute testes: `pytest`

## Reportando Bugs

Ao reportar um bug, inclua:
1. Descrição clara do problema
2. Passos para reproduzir
3. Comportamento esperado vs atual
4. Screenshots (se aplicável)
5. Ambiente (SO, versões, etc.)

## Sugerindo Melhorias

Adoramos sugestões! Abra uma issue com:
1. Descrição da melhoria
2. Motivação/casos de uso
3. Exemplos (se aplicável)

## Código de Conduta

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mantenha discussões profissionais

## Dúvidas?

Abra uma issue com a tag `question` ou entre em contato!

Obrigado por contribuir! 🚀
