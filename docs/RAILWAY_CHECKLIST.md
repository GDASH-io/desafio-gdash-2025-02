# ✅ Checklist de Deploy - Railway

Use este checklist para garantir que tudo está configurado corretamente.

## 📦 Fase 1: Preparação Local

- [ ] Executei `.\prepare-railway-deploy.ps1`
- [ ] Todos os arquivos necessários estão presentes
- [ ] Variáveis de ambiente no `.env` estão configuradas
- [ ] Código está commitado no Git
- [ ] Push para GitHub realizado (`git push origin main`)
- [ ] Repositório é público ou Railway tem acesso

## 🏗️ Fase 2: Configuração Railway

### Projeto
- [ ] Conta Railway criada (https://railway.app)
- [ ] Novo projeto criado
- [ ] Repositório GitHub conectado

### Serviço 1: MongoDB
- [ ] Database MongoDB adicionada
- [ ] `MONGO_URL` copiado para usar nos outros serviços
- [ ] Status: Running

### Serviço 2: RabbitMQ
- [ ] Empty Service criado
- [ ] Docker Image configurado: `rabbitmq:3-management`
- [ ] Porta 5672 configurada
- [ ] Variáveis configuradas:
  - [ ] `RABBITMQ_DEFAULT_USER=admin`
  - [ ] `RABBITMQ_DEFAULT_PASS=<senha-forte>`
- [ ] Status: Running
- [ ] Management UI acessível (porta 15672)

### Serviço 3: NestJS API
- [ ] GitHub Repo conectado
- [ ] Root Directory: `/nestjs-api`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm run start:prod`
- [ ] Porta 3000 configurada
- [ ] Variáveis configuradas:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`
  - [ ] `MONGODB_URI=<mongo-url-railway>`
  - [ ] `JWT_SECRET=<64-chars-aleatórios>`
  - [ ] `DEFAULT_USER_EMAIL=<email>`
  - [ ] `DEFAULT_USER_PASSWORD=<senha-forte>`
  - [ ] `DEFAULT_USER_NAME=<nome>`
  - [ ] `TOGETHER_API_KEY=<key>` (opcional)
- [ ] Domínio público gerado
- [ ] URL anotada: `_______________________`
- [ ] Status: Running
- [ ] Health check OK: `/health`

### Serviço 4: Go Weather Worker
- [ ] GitHub Repo conectado
- [ ] Root Directory: `/go-weather-worker`
- [ ] Variáveis configuradas:
  - [ ] `RABBITMQ_URL=amqp://admin:<senha>@rabbitmq.railway.internal:5672/`
  - [ ] `RABBITMQ_QUEUE=weather_data`
  - [ ] `API_BASE_URL=http://nestjs-api.railway.internal:3000`
  - [ ] `API_ENDPOINT=/api/weather/logs`
  - [ ] `WORKER_CONCURRENCY=5`
  - [ ] `RETRY_ATTEMPTS=3`
  - [ ] `RETRY_DELAY=2s`
- [ ] Status: Running
- [ ] Logs mostram: "Worker iniciado!"

### Serviço 5: Python Weather Collector
- [ ] GitHub Repo conectado
- [ ] Root Directory: `/python-weather-collector`
- [ ] Start Command: `python -m src.main`
- [ ] Variáveis configuradas:
  - [ ] `RABBITMQ_HOST=rabbitmq.railway.internal`
  - [ ] `RABBITMQ_PORT=5672`
  - [ ] `RABBITMQ_USER=admin`
  - [ ] `RABBITMQ_PASSWORD=<senha-rabbitmq>`
  - [ ] `RABBITMQ_QUEUE=weather_data`
  - [ ] `COLLECTION_INTERVAL=300`
  - [ ] `LATITUDE=-23.5505`
  - [ ] `LONGITUDE=-46.6333`
- [ ] Status: Running
- [ ] Logs mostram: "Conectado ao RabbitMQ"

### Serviço 6: Frontend (React/Vite)
- [ ] GitHub Repo conectado
- [ ] Root Directory: `/desafio_gdash`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npx serve -s dist -l 8080`
- [ ] Porta 8080 configurada
- [ ] Variáveis configuradas:
  - [ ] `VITE_API_URL=<url-nestjs-api>` (sem / no final)
- [ ] Domínio público gerado
- [ ] URL anotada: `_______________________`
- [ ] Status: Running

## 🧪 Fase 3: Testes

### API
- [ ] Health check responde: `curl https://<api>.railway.app/health`
- [ ] Stats funcionando: `curl https://<api>.railway.app/api/weather/stats`
- [ ] Login funcionando via Postman/curl

### Frontend
- [ ] Site acessível: `https://<frontend>.railway.app`
- [ ] Página de login carrega
- [ ] Login funciona com credenciais configuradas
- [ ] Dashboard exibe dados
- [ ] Gráficos renderizam
- [ ] Insights IA funcionando (se configurado)
- [ ] Export CSV/XLSX funciona
- [ ] Pokémons carregam na página Explorar

### Integração
- [ ] Python Collector está coletando dados (ver logs)
- [ ] RabbitMQ recebe mensagens (Management UI)
- [ ] Go Worker processa mensagens (ver logs)
- [ ] NestJS API recebe dados (ver logs)
- [ ] Frontend exibe novos dados após 5 minutos

## 📊 Fase 4: Monitoramento

### Logs
- [ ] MongoDB: sem erros
- [ ] RabbitMQ: sem erros de conexão
- [ ] Python Collector: "Dados publicados com sucesso"
- [ ] Go Worker: "Mensagem processada com sucesso"
- [ ] NestJS API: "POST /api/weather/logs" retorna 201
- [ ] Frontend: sem erros 404 ou 500

### Métricas
- [ ] CPU usage < 80%
- [ ] Memory usage < 80%
- [ ] Todos os serviços "Running"
- [ ] Sem restart loops

## 🔒 Fase 5: Segurança

- [ ] Senhas fortes configuradas (> 16 chars)
- [ ] JWT_SECRET único (64 chars)
- [ ] `.env` NÃO commitado no GitHub
- [ ] Credenciais de admin alteradas do padrão
- [ ] TOGETHER_API_KEY protegida (se usar)
- [ ] CORS configurado corretamente na API

## 💰 Fase 6: Custos

- [ ] Verificado uso de créditos no Dashboard Railway
- [ ] Entendido custo estimado (~$15-25/mês)
- [ ] Configurado limite de gastos (opcional)
- [ ] Alertas de custo configurados

## 📝 Fase 7: Documentação

- [ ] URLs públicas documentadas
- [ ] Credenciais salvas em local seguro (1Password, Bitwarden)
- [ ] Variáveis de ambiente documentadas
- [ ] Processo de deploy documentado para time

## 🎉 Deploy Completo!

- [ ] Todos os itens acima verificados
- [ ] Sistema funcionando end-to-end
- [ ] Equipe notificada
- [ ] URLs compartilhadas

---

## 📞 Suporte

Se algo não funcionar:

1. **Verifique logs** de cada serviço na Railway
2. **Consulte** `RAILWAY_DEPLOY.md` para troubleshooting
3. **Confirme** variáveis de ambiente
4. **Teste** endpoints individualmente

---

**Data do Deploy:** ___/___/______
**Deployado por:** _________________
**URLs:**
- Frontend: _______________________
- API: _______________________
- RabbitMQ Management: _______________________
